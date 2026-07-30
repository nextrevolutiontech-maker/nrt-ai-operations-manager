import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import express from 'express';

const server = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    const app = await NestFactory.create(AppModule, server);
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
    isBootstrapped = true;
  }
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
