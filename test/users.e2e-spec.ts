import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { JwtService } from '@nestjs/jwt';
import { delay } from './helpers/delay';
import {
  MeViewDto,
  UserViewDto,
} from '../src/features/user-accounts/api/view-dto/users.view-dto';
import { EmailService } from '../src/features/notifications/email.service';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { UsersTestManager } from './helpers/users-test-manager';
import { CreateUserDto } from '../src/features/user-accounts/dto/create-user.dto';
import { JwtConfig } from '../src/features/user-accounts/config/jwt.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (jwtConfig: JwtConfig) => {
            return new JwtService({
              secret: jwtConfig.jwtSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [JwtConfig],
        });
    });

    app = result.app;
    usersTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest
      .spyOn(ThrottlerGuard.prototype, 'canActivate')
      .mockImplementation(async (context: ExecutionContext) => true);
  });

  it('should create user', async () => {
    const body: CreateUserDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const response = await usersTestManager.createUser(body);

    expect(response).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('shouldn`t create user with non-unique email', async () => {
    const firstUser: CreateUserDto = {
      login: 'firstUser',
      password: 'password1',
      email: 'firstUser@gmail.com',
    };
    const secondUser: CreateUserDto = {
      login: 'secondUser',
      password: 'password2',
      email: 'firstUser@gmail.com',
    };

    await usersTestManager.createUser(firstUser);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(secondUser)
      .auth(usersTestManager.authUsername, usersTestManager.authPassword)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'This email address has already been used',
            field: 'email',
          },
        ],
      });
  });

  it('shouldn`t create user with non-unique login', async () => {
    const firstUser = {
      login: 'firstUser',
      password: 'password1',
      email: 'firstUser@gmail.com',
    };
    const secondUser = {
      login: 'firstUser',
      password: 'password2',
      email: 'secondUser@gmail.com',
    };

    await usersTestManager.createUser(firstUser);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(secondUser)
      .auth(usersTestManager.authUsername, usersTestManager.authPassword)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: 'This login has already been used',
            field: 'login',
          },
        ],
      });
  });

  it('should get users with paging', async () => {
    const users = await usersTestManager.createSeveralUsers(9);
    const { body: responseBody } = (await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/sa/users?pageSize=5&pageNumber=2&sortDirection=asc&sortBy=login`,
      )
      .auth(usersTestManager.authUsername, usersTestManager.authPassword)
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

    expect(responseBody.totalCount).toBe(9);
    expect(responseBody.items).toHaveLength(4);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[3]).toEqual(users[users.length - 1]);
  });

  it('unauthorized user shouldn`t get/create/delete blog', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/sa/users/`)
      .expect(HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users/`)
      .expect(HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/users/1`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should delete user', async () => {
    const body: CreateUserDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const user = await usersTestManager.createUser(body);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/users/${user.id}`)
      .auth(usersTestManager.authUsername, usersTestManager.authPassword)
      .expect(HttpStatus.NO_CONTENT);
  });

  describe('auth', () => {
    it('should return users info while "me" request with correct accessTokens', async () => {
      const tokens = await usersTestManager.createAndLoginSeveralUsers(1);

      const responseBody = await usersTestManager.me(tokens[0].accessToken);

      expect(responseBody).toEqual({
        login: expect.anything(),
        userId: expect.anything(),
        email: expect.anything(),
      } as MeViewDto);
    });

    it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
      const tokens = await usersTestManager.createAndLoginSeveralUsers(1);
      await delay(2000);
      await usersTestManager.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
    });

    it('should get new accessToken and refreshToken', async () => {
      const userData = {
        login: 'Madrid',
        password: 'password1',
        email: 'madrid@gmail.com',
      };

      await usersTestManager.createUser(userData);

      const authDataWithLogin = {
        loginOrEmail: 'Madrid',
        password: 'password1',
      };

      const response = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send(authDataWithLogin)
        .expect(HttpStatus.OK);

      const refreshToken = usersTestManager.extractRefreshToken(response);
      const accessToken = response.body.accessToken;

      await delay(500);

      const newResponse = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.OK);

      const newRefreshToken = usersTestManager.extractRefreshToken(newResponse);
      const newAccessToken = newResponse.body.accessToken;

      // Проверяем, что токены обновились
      expect(refreshToken).not.toBe(newRefreshToken);
      expect(accessToken).not.toBe(newAccessToken);
    });

    it(`should register user without really send email`, async () => {
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          email: 'email@email.em',
          password: '123123123',
          login: 'login123',
        } as CreateUserDto)
        .expect(HttpStatus.NO_CONTENT);
    });

    it(`should call email sending method while registration`, async () => {
      const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail =
        jest.fn().mockImplementation(() => Promise.resolve()));

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          email: 'email3@email.em',
          password: '123123123',
          login: 'login1233',
        } as CreateUserDto)
        .expect(HttpStatus.NO_CONTENT);

      expect(sendEmailMethod).toHaveBeenCalled();
    });

    it('shouldn`t authenticate with incorrect data', async () => {
      const randomAuthData = {
        loginOrEmail: 'Bezgoev',
        password: 'qwerty',
      };

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send(randomAuthData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should authenticate with correct data', async () => {
      const userData = {
        login: 'Artur',
        password: 'password1',
        email: 'bezgoev@gmail.com',
      };

      await usersTestManager.createUser(userData);

      const authDataWithLogin = {
        loginOrEmail: 'Artur',
        password: 'password1',
      };

      const authDataWithEmail = {
        loginOrEmail: 'bezgoev@gmail.com',
        password: 'password1',
      };

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send(authDataWithLogin)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send(authDataWithEmail)
        .expect(HttpStatus.OK);
    });
  });
});
