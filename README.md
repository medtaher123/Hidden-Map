# Projet Web Flutter

A full-stack monorepo containing a NestJS API, Angular web application, and Flutter mobile app.

## Project Structure

```
├── api/              # NestJS REST API
├── web/              # Angular web application
├── mobile/           # Flutter mobile application (iOS, Android, Web, Linux, macOS, Windows)
└── README.md
```

## Prerequisites

- Node.js (v18+)
- npm or pnpm
- Flutter SDK (for mobile development)
- Dart SDK (included with Flutter)

## Installation

### API (NestJS)

```bash
cd api
npm install
npm run start:dev
```

### Web (Angular)

```bash
cd web
npm install
npm start
```

### Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```
