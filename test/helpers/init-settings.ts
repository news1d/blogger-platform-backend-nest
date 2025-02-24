import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { UsersTestManager } from './users-test-manager';
import { deleteAllData } from './delete-all-data';
import { EmailService } from '../../src/features/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { appSetup } from '../../src/setup/app.setup';
import { AppModule } from '../../src/app.module';
import { BlogsTestManager } from './blogs-test-manager';
import { AuthConfig } from '../../src/features/user-accounts/config/auth.config';
import { PostsTestManager } from './posts-test-manager';
import cookieParser from 'cookie-parser';
import { DevicesTestManager } from './devices-test-manager';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  app.use(cookieParser());

  appSetup(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const authConfig = app.get(AuthConfig);
  const userTestManager = new UsersTestManager(app, authConfig);
  const blogsTestManager = new BlogsTestManager(app, authConfig);
  const postsTestManager = new PostsTestManager(app, authConfig);
  const devicesTestManager = new DevicesTestManager(app, userTestManager);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger: userTestManager,
    blogsTestManager,
    postsTestManager,
    devicesTestManager,
  };
};
