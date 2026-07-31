import '../src/common/patches/express-adapter.patch';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import express from 'express';

const server = express();
let cachedApp: any = null;

server.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'NRT AI Operations Manager API is live and operational 🚀',
    version: '1.0.0',
    documentation: '/api/v1',
    timestamp: new Date().toISOString(),
  });
});

async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn'],
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    await bootstrapServer();
    server(req, res);
  } catch (error: any) {
    console.error('Vercel Serverless Bootstrap Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Vercel Serverless Function Bootstrap Error',
      error: error?.message || String(error),
    });
  }
}
