// registers aliases, DON'T REMOVE THIS LINE!
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import AppModule from './components/app/app.module';
import AppService from './components/app/app.service';
import AllExceptionsFilter from './filters/all-exceptions.filter';
import ConsoleLogger from './shared/loggers/console.logger';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: ConsoleLogger,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const appService = app.get<AppService>('AppService');
  const port: number = appService.getPort();
  const options = new DocumentBuilder()
    .setTitle('Api v1')
    .setDescription('The currencies API')
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    ConsoleLogger.log(
      `The server is running on ${port} port: ${appService.getBaseUrl()}/api`,
      'Api Bootstrap',
      true,
    );
  });
}
bootstrap();
