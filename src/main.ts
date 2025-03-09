import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建 Fastify 适配器
  const fastifyAdapter = new FastifyAdapter();

  // 创建 Nest 应用实例
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // 启用 CORS
  app.enableCors();

  // 可选：设置全局前缀
  // app.setGlobalPrefix('api');

  // 监听端口
  await app.listen(3000, '0.0.0.0');
  console.log(`应用已启动: ${await app.getUrl()}`);
}
bootstrap();
