import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Location } from '../src/locations/entities/location.entity';
import { Photo } from '../src/locations/entities/photo.entity';
import { User } from '../src/users/entities/user.entity';
import { Comment } from '../src/comments/entities/comment.entity';
import { Rating } from '../src/ratings/entities/rating.entity';
import { Favorite } from '../src/favorites/entities/favorite.entity';
import { Follower } from '../src/followers/entities/follower.entity';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';

const mockLocations = [
  {
    name: 'Medina Coffee House',
    description:
      'Hidden gem cafe in the heart of the medina with authentic Tunisian coffee and pastries',
    category: 'cafe',
    latitude: 36.7983,
    longitude: 10.1756,
    address: 'Rue des Teinturiers',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
        caption: 'Medina coffee house interior',
      },
    ],
  },
  {
    name: 'Bardo Museum',
    description:
      'World-class museum featuring Roman mosaics and ancient artifacts',
    category: 'museum',
    latitude: 36.8018,
    longitude: 10.1839,
    address: 'Rue de Rome',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1564399579945-7ce172fef407?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1564399579945-7ce172fef407?w=300',
        caption: 'Bardo Museum exterior',
      },
    ],
  },
  {
    name: 'Belvedere Park',
    description:
      'Beautiful scenic park with panoramic views of Tunis and surrounding landscape',
    category: 'park',
    latitude: 36.8081,
    longitude: 10.1753,
    address: 'Montfleury',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300',
        caption: 'Park scenic view',
      },
    ],
  },
  {
    name: 'Artisan Souk Market',
    description:
      'Vibrant marketplace with traditional crafts and local textiles',
    category: 'shop',
    latitude: 36.7978,
    longitude: 10.1744,
    address: 'Souks District',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1555529386-643b1a3da184?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1555529386-643b1a3da184?w=300',
        caption: 'Traditional market',
      },
    ],
  },
  {
    name: 'Dar El Harissa Art Gallery',
    description:
      'Contemporary art gallery showcasing local Tunisian and African artists',
    category: 'art',
    latitude: 36.8045,
    longitude: 10.1878,
    address: 'Rue Sidi Hassine',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1561214115-6beb64dc405e?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1561214115-6beb64dc405e?w=300',
        caption: 'Art gallery exhibition',
      },
    ],
  },
  {
    name: 'El Barth Traditional Restaurant',
    description:
      'Family-owned restaurant serving authentic Tunisian couscous and tajine dishes',
    category: 'restaurant',
    latitude: 36.7965,
    longitude: 10.1799,
    address: 'Rue Jamaa el Zitouna',
    city: 'Tunis',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
        caption: 'Restaurant dining area',
      },
    ],
  },
  {
    name: 'La Goulette Seaside Walk',
    description:
      'Scenic coastal promenade with fresh seafood restaurants and sea breeze',
    category: 'viewpoint',
    latitude: 36.807,
    longitude: 10.3152,
    address: 'Waterfront',
    city: 'La Goulette',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300',
        caption: 'Seaside promenade',
      },
    ],
  },
  {
    name: 'Sidi Bou Said Blue Town',
    description:
      'Picturesque village with blue and white traditional architecture perched on a hill',
    category: 'art',
    latitude: 36.8705,
    longitude: 10.3553,
    address: 'Main Avenue',
    city: 'Sidi Bou Said',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        caption: 'Blue and white architecture',
      },
    ],
  },
];

async function seed(configService: ConfigService) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: configService.get<number>('DB_PORT') || 5432,
    username: configService.get<string>('DB_USERNAME') || 'postgres',
    password: configService.get<string>('DB_PASSWORD') || 'postgres',
    database: configService.get<string>('DB_NAME') || 'hidden_map',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const locationRepository = dataSource.getRepository(Location);
    const photoRepository = dataSource.getRepository(Photo);
    const userRepository = dataSource.getRepository(User);
    const commentRepository = dataSource.getRepository(Comment);
    const ratingRepository = dataSource.getRepository(Rating);
    const favoriteRepository = dataSource.getRepository(Favorite);
    const followerRepository = dataSource.getRepository(Follower);


    // Clear existing data in correct order (delete child records first)
    await dataSource.createQueryBuilder().delete().from(Comment).execute();
    await dataSource.createQueryBuilder().delete().from(Rating).execute();
    await dataSource.createQueryBuilder().delete().from(Favorite).execute();
    await dataSource.createQueryBuilder().delete().from(Photo).execute();
    await dataSource.createQueryBuilder().delete().from(Location).execute();
    await dataSource.createQueryBuilder().delete().from(Follower).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    console.log('Cleared existing data');

    // Create test user with specific UUID
    const testUser = userRepository.create({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'testuser',
      email: 'test@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      bio: 'Test user for development',
      password: await bcrypt.hash('testpassword', 10),
    });
    await userRepository.save(testUser);
    console.log('✓ Created test user');

    // Create additional test users
    const user2 = userRepository.create({
      name: 'explorer',
      email: 'explorer@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      bio: 'Love discovering hidden gems!',
      password: await bcrypt.hash('explorerpassword', 10),
    });
    await userRepository.save(user2);

    const user3 = userRepository.create({
      name: 'foodie',
      email: 'foodie@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      bio: 'Food enthusiast and cafe hopper',
      password: await bcrypt.hash('foodiepassword', 10),
    });
    await userRepository.save(user3);
    console.log('✓ Created additional test users');

    for (const locationData of mockLocations) {
      const { photos, ...locationFields } = locationData;

      const location = locationRepository.create(locationFields);

      const savedLocation = await locationRepository.save(location);

      for (const photoData of photos) {
        const photo = photoRepository.create({
          ...photoData,
          location: savedLocation,
        });

        await photoRepository.save(photo);
      }

      console.log(`✓ Added location: ${location.name}`);
    }
    // explorer follows testuser
    const follower1 = followerRepository.create({
      user: testUser,
      followerUser: user2,
    });
    // foodie follows testuser
    const follower2 = followerRepository.create({
      user: testUser,
      followerUser: user3,
    });
    await followerRepository.save([follower1, follower2]);

    console.log('✓ Added followers for testuser');

    const following = followerRepository.create({
      user: user2,           // explorer is being followed
      followerUser: testUser // testuser follows explorer
    });

    await followerRepository.save(following);

    console.log('✓ testuser follows explorer');

    console.log('\nSeeding completed successfully!');
    console.log(`Added ${mockLocations.length} locations with photos`);
    console.log('Added 3 test users');
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  );
  const config = appContext.get(ConfigService);
  await seed(config);
}

bootstrap();
