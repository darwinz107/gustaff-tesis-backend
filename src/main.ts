import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
var cookieParser = require('cookie-parser')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:process.env.ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials:true
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist:false
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
