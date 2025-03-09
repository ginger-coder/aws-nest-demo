import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { AppModule } from './src/app.module';
import fastifyAwsLambda from '@fastify/aws-lambda';

let cachedServer: any;

// 创建 Fastify 实例的函数
async function bootstrap() {
  if (!cachedServer) {
    // 创建 Fastify 适配器
    const fastifyAdapter = new FastifyAdapter({
      logger: true,
      // Fastify 配置选项
      trustProxy: true,
      ignoreTrailingSlash: true,
    });

    // 创建 NestJS 应用实例
    const app = await NestFactory.create(AppModule, fastifyAdapter, {
      logger: ['error', 'warn'],
    });

    // 全局配置
    app.enableCors();

    // 初始化应用但不启动监听
    await app.init();

    // 获取底层的 Fastify 实例
    const instance = app.getHttpAdapter().getInstance();

    // 使用 @fastify/aws-lambda 创建处理器
    cachedServer = fastifyAwsLambda(instance);
  }

  return cachedServer;
}

// Lambda 处理函数
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // 获取服务器实例
  const server = await bootstrap();

  // 处理请求
  return server(event, context);
};