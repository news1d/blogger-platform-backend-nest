import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { UsersTestManager } from './users-test-manager';

export class DevicesTestManager {
  constructor(
    private app: INestApplication,
    private usersTestManager: UsersTestManager,
  ) {}

  async login(
    loginOrEmail: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ) {
    return await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail, password })
      .expect(statusCode);
  }

  async createLoginSeveralUsersAndExtractRefreshTokens(count: number) {
    const users = await this.usersTestManager.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    const responses = await Promise.all(loginPromises);

    return responses.map((response) =>
      this.usersTestManager.extractRefreshToken(response),
    );
  }
}
