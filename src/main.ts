import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get<CoreConfig>(CoreConfig);

  app.use(cookieParser());
  app.enableCors();
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  appSetup(app);
  await app.listen(appConfig.port);
}
bootstrap();
