// registers aliases, DON'T REMOVE THIS LINE!
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import AppModule from './components/app/app.module';
import AppService from './components/app/app.service';
import AllExceptionsFilter from './filters/all-exceptions.filter';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const appService = app.get<AppService>('AppService');
  const port: string | number = appService.getPort();
  const options = new DocumentBuilder()
    .setTitle('Api v1')
    .setDescription('The currencies API')
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    Logger.log(`The server is running on ${port} port: ${appService.getBaseUrl()}/api`);
  });
}
bootstrap();
