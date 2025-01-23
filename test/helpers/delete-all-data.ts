import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const deleteAllData = async (app: INestApplication) => {
  return request(app.getHttpServer()).delete(`/api/testing/all-data`);
};
