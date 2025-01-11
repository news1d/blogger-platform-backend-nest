import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  appSetup(app);

  // Тут добавить подключение к базе данных
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
