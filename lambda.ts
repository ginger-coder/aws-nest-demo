import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './src/app.module';
import { Context, Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

let server: any;

async function bootstrap() {
  // 使用正确的 Fastify 配置
  const adapter = new FastifyAdapter({
    logger: true,
    disableRequestLogging: process.env.NODE_ENV === 'production',
    trustProxy: true
  });

  // 创建 NestJS 应用
  const app = await NestFactory.create(AppModule, adapter);
  
  // 启用必要的功能
  app.enableCors();
  
  // 等待应用初始化
  await app.init();
  
  // 获取 Fastify 实例
  const instance = app.getHttpAdapter().getInstance();
  
  // 确保 Fastify 已准备好
  await instance.ready();
  
  // 返回服务器
  return serverlessExpress({ app: instance });
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // 避免函数执行挂起
  context.callbackWaitsForEmptyEventLoop = false;
  
  // 服务器实例缓存
  server = server ?? await bootstrap();
  
  try {
    // 处理请求
    return await server(event, context);
  } catch (error) {
    console.error('Lambda处理请求时出错:', error);
    
    // 返回格式化的错误信息
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
      })
    };
  }
};