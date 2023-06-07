import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, { logger });
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || 'api');
  app.useGlobalPipes(new ValidationPipe());

  /* SWAGGER config */
  if (process.env.NODE_ENV.trim() === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('horbas-lanars-api')
      .setDescription('')
      .setVersion('0.0.0')
      .addBearerAuth()
      .build();
    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/swagger', app, swaggerDoc);
  }

  const port = process.env.GLOBAL_PORT || 5000;
  await app.listen(port);
  logger.debug(`Application started on port: ${port}`);
}
bootstrap();
