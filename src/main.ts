import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({}));

  const config = new DocumentBuilder()
    .setTitle('Event Ticket Booking System')
    .setDescription('The Ticketbox API description')
    .setVersion('1.0')
    .addTag('Movie')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const PORT = 3069;
  await app.listen(PORT, () => {
    console.log(`[SUCCESS] BE started successfully at http://localhost:${PORT}`)
  });
}
bootstrap();
