import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get<CoreConfig>(CoreConfig);

  app.enableCors();
  appSetup(app);
  await app.listen(appConfig.port);
}
bootstrap();
