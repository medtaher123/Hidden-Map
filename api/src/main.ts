import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins in development
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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hidden Map API')
    .setDescription('API for discovering and sharing hidden locations')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
