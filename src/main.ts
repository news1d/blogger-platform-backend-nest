import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get<CoreConfig>(CoreConfig);

  app.enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  appSetup(app);
  await app.listen(appConfig.port);
}
bootstrap();
