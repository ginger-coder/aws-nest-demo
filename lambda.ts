import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './src/app.module';
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { awsLambdaFastify } from '@fastify/aws-lambda';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const nestApp = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    await nestApp.init();

    const instance = nestApp.getHttpAdapter().getInstance();
    cachedServer = awsLambdaFastify(instance);
  }
  return cachedServer;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const server = await bootstrap();
  return server(event, context);
};
