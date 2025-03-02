import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { DevicesTestManager } from './helpers/devices-test-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { delay } from './helpers/delay';

describe('devices', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let devicesTestManager: DevicesTestManager;

  beforeAll(async () => {
    const result = await initSettings(() => {});

    app = result.app;
    usersTestManager = result.userTestManger;
    devicesTestManager = result.devicesTestManager;
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

  it('shouldn`t terminate session of a non-existent device', async () => {
    await usersTestManager.createUser();

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({
        loginOrEmail: usersTestManager.userData.login,
        password: usersTestManager.userData.password,
      })
      .expect(HttpStatus.OK);

    const refreshToken = usersTestManager.extractRefreshToken(response);

    const randomDeviceId = uuidv4();

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/devices/${randomDeviceId}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('shouldn`t terminate device session of other user', async () => {
    const refreshTokens =
      await devicesTestManager.createLoginSeveralUsersAndExtractRefreshTokens(
        2,
      );

    const { body: secondUserSessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshTokens[1]}`)
      .expect(HttpStatus.OK);

    const secondUserDeviceId = secondUserSessions[0].deviceId;

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${secondUserDeviceId}`)
      .set('Cookie', `refreshToken=${refreshTokens[0]}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should update LastActiveDate of session', async () => {
    await usersTestManager.createUser();

    const loginResponses: request.Response[] = [];
    for (let i = 0; i < 4; i++) {
      const response = await devicesTestManager.login(
        usersTestManager.userData.login,
        usersTestManager.userData.password,
      );

      loginResponses.push(response);
    }

    const refreshToken = usersTestManager.extractRefreshToken(
      loginResponses[0],
    );

    // Получаем информацию об активных сессиях пользователя
    const { body: sessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Должно быть 4 сессии
    expect(sessions).toHaveLength(4);

    await delay(1500);

    // Обновляем refreshToken пользователя для первой сессии
    const refreshTokenResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    const newRefreshToken =
      usersTestManager.extractRefreshToken(refreshTokenResponse);

    // Получаем обновлённую информацию об активных сессиях пользователя
    const { body: updatedSessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${newRefreshToken}`)
      .expect(HttpStatus.OK);

    // Кол-во сессий должно остаться прежним
    expect(updatedSessions).toHaveLength(4);

    // LastActiveDate должен измениться только у первой сессии
    updatedSessions.forEach((updatedSession) => {
      const originalSession = sessions.find(
        (s) => s.deviceId === updatedSession.deviceId,
      );

      if (!originalSession)
        throw new Error(
          `Session with deviceId ${updatedSession.deviceId} not found`,
        );

      if (updatedSession.deviceId === sessions[0].deviceId) {
        expect(originalSession.lastActiveDate).not.toBe(
          updatedSession.lastActiveDate,
        );
      } else {
        expect(originalSession.lastActiveDate).toBe(
          updatedSession.lastActiveDate,
        );
      }
    });
  });

  it('should terminate session', async () => {
    await usersTestManager.createUser();

    const loginResponses: request.Response[] = [];
    for (let i = 0; i < 4; i++) {
      const response = await devicesTestManager.login(
        usersTestManager.userData.login,
        usersTestManager.userData.password,
      );

      loginResponses.push(response);
    }

    const refreshToken = usersTestManager.extractRefreshToken(
      loginResponses[0],
    );

    // Получаем информацию об активных сессиях пользователя
    const { body: sessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Должно быть 4 сессии
    expect(sessions).toHaveLength(4);

    // Завершаем вторую сессию, используя refreshToken первой сессии
    const deletedSessionDeviceId = sessions[1].deviceId;
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices/${deletedSessionDeviceId}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.NO_CONTENT);

    // Получаем обновлённую информацию об активных сессиях пользователя
    const { body: updatedSessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Кол-во сессий должно измениться
    expect(updatedSessions).toHaveLength(3);

    // Проверяем, что удаленной сессии больше нет
    const isDeletedSessionPresent = updatedSessions.some(
      (session) => session.deviceId === deletedSessionDeviceId,
    );

    // Ожидаем, что удаленной сессии нет среди оставшихся
    expect(isDeletedSessionPresent).toBe(false);
  });

  it('should logout and terminate session', async () => {
    await usersTestManager.createUser();

    const loginResponses: request.Response[] = [];
    for (let i = 0; i < 4; i++) {
      const response = await devicesTestManager.login(
        usersTestManager.userData.login,
        usersTestManager.userData.password,
      );

      loginResponses.push(response);
    }

    const refreshToken = usersTestManager.extractRefreshToken(
      loginResponses[0],
    );

    // Получаем информацию об активных сессиях пользователя
    const { body: sessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Должно быть 4 сессии
    expect(sessions).toHaveLength(4);

    const secondSessionRefreshToken = usersTestManager.extractRefreshToken(
      loginResponses[1],
    );

    // Выходим из второй сессии
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/logout`)
      .set('Cookie', `refreshToken=${secondSessionRefreshToken}`)
      .expect(HttpStatus.NO_CONTENT);

    // Получаем обновлённую информацию об активных сессиях пользователя
    const { body: updatedSessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Кол-во сессий должно измениться
    expect(updatedSessions).toHaveLength(3);

    // Проверяем, что завершенной сессии больше нет
    const isTerminatedSessionPresent = updatedSessions.some(
      (session) => session.deviceId === sessions[1].deviceId,
    );

    // Ожидаем, что завершенной сессии нет среди оставшихся
    expect(isTerminatedSessionPresent).toBe(false);
  });

  it('should terminate other sessions', async () => {
    await usersTestManager.createUser();

    const loginResponses: request.Response[] = [];
    for (let i = 0; i < 4; i++) {
      const response = await devicesTestManager.login(
        usersTestManager.userData.login,
        usersTestManager.userData.password,
      );

      loginResponses.push(response);
    }

    const refreshToken = usersTestManager.extractRefreshToken(
      loginResponses[0],
    );

    // Получаем информацию об активных сессиях пользователя
    const { body: sessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Должно быть 4 сессии
    expect(sessions).toHaveLength(4);

    // Завершаем все сессии, кроме первой
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.NO_CONTENT);

    // Получаем обновлённую информацию об активных сессиях пользователя
    const { body: updatedSessions } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/security/devices`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatus.OK);

    // Кол-во сессий должно измениться
    expect(updatedSessions).toHaveLength(1);
    expect(sessions[0].deviceId).toBe(updatedSessions[0].deviceId);
  });
});
