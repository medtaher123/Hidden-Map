import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // transform payloads to DTO instances
      whitelist: true, // strip properties that are not in the DTO
      forbidNonWhitelisted: true, // throw error if unknown properties are sent
      forbidUnknownValues: true, // throw error if non-object/invalid values
      transformOptions: {
        enableImplicitConversion: true, // allow automatic conversion of primitives
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
