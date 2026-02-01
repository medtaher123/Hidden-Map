import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'providers/locations_provider.dart';
import 'providers/auth_provider.dart';
import 'services/follower_service.dart';
import 'services/user_service.dart';
import 'screens/map_screen.dart';
import 'screens/submit_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/edit_profile_screen.dart';
import 'screens/favorites_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProxyProvider<AuthProvider, LocationsProvider>(
          create: (_) => LocationsProvider(),
          update: (_, authProvider, locationsProvider) {
            locationsProvider!.setToken(authProvider.token);
            return locationsProvider;
          },
        ),
        // Add UserService - provides user data fetching capabilities
        ProxyProvider<AuthProvider, UserService>(
          update: (_, authProvider, __) =>
              UserService(token: authProvider.token),
        ),
        // Add FollowerService - provides follow/unfollow capabilities
        ProxyProvider<AuthProvider, FollowerService>(
          update: (_, authProvider, __) =>
              FollowerService(getToken: () => authProvider.token),
        ),
      ],
      child: MaterialApp.router(
        title: 'HiddenMap',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        routerConfig: _router,
      ),
    );
  }
}

final _router = GoRouter(
  initialLocation: '/',
  debugLogDiagnostics: true,
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return ScaffoldWithNavBar(child: child);
      },
      routes: [
        GoRoute(path: '/', builder: (context, state) => const MapScreen()),
        GoRoute(
          path: '/submit',
          builder: (context, state) => const SubmitScreen(),
        ),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/leaderboard',
          builder: (context, state) => const LeaderboardScreen(),
        ),
        // CHANGED: Updated '/me' route to use '/profile' for consistency
        GoRoute(
          path: '/profile',
          builder: (context, _) => const ProfileScreen(),
        ),
      ],
    ),
    GoRoute(path: '/admin', builder: (context, state) => const AdminScreen()),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/favorites',
      builder: (context, state) => const FavoritesScreen(),
    ),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/profile/edit',
      builder: (context, state) => const EditProfileScreen(),
    ),
    // View other users' profiles by ID
    GoRoute(
      path: '/profile/:userId',
      builder: (context, state) {
        final userId = state.pathParameters['userId']!;
        return ProfileScreen(userId: userId);
      },
    ),
  ],
);

class ScaffoldWithNavBar extends StatelessWidget {
  final Widget child;

  const ScaffoldWithNavBar({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).uri.path;
    final authProvider = context.watch<AuthProvider>();

    int currentIndex = 0;
    if (authProvider.isAdmin && currentPath == '/dashboard') {
      currentIndex = 1;
    } else if (currentPath == '/submit') {
      currentIndex = 1;
    } else if (currentPath == '/leaderboard') {
      currentIndex = 2;
    } else if (currentPath == '/profile') {
      currentIndex = 3;
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Row(
          children: [
            const Icon(Icons.map, size: 28),
            const SizedBox(width: 8),
            Text(
              'HiddenMap',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          // Favorites button
          if (authProvider.isAuthenticated)
            IconButton(
              icon: const Icon(Icons.favorite),
              onPressed: () => context.push('/favorites'),
              tooltip: 'Favorites',
            ),
          // Notifications button
          if (authProvider.isAuthenticated)
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () => context.push('/notifications'),
              tooltip: 'Notifications',
            ),
          // Admin button - only show for admin users
          if (authProvider.isAdmin)
            IconButton(
              icon: const Icon(Icons.admin_panel_settings),
              onPressed: () => context.push('/admin'),
              tooltip: 'Pending Locations',
            ),
        ],
      ),
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) {
          if (index == 0) {
            context.go('/');
          } else if (index == 1) {
            if (authProvider.isAdmin) {
              context.go('/dashboard');
            } else {
              context.go('/submit');
            }
          } else if (index == 2) {
            context.go('/leaderboard');
          } else if (index == 3) {
            if (authProvider.isAuthenticated) {
              context.go('/profile');
            } else {
              context.push('/login');
            }
          }
        },
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Discover',
          ),
          BottomNavigationBarItem(
            icon: Icon(
              authProvider.isAdmin ? Icons.dashboard : Icons.add_location,
            ),
            label: authProvider.isAdmin ? 'Dashboard' : 'Submit',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.leaderboard),
            label: 'Leaderboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(
              authProvider.isAuthenticated ? Icons.person : Icons.person_add,
            ),
            label: authProvider.isAuthenticated ? 'Profile' : 'Join',
            backgroundColor: authProvider.isAuthenticated ? null : Colors.blue,
          ),
        ],
      ),
    );
  }
}
