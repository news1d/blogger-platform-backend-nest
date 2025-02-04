import { AppModule } from '../app.module';
import { useContainer } from 'class-validator';
import { INestApplication } from '@nestjs/common';

export const validationConstraintSetup = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
