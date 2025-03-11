import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { add } from 'date-fns';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserByIdOrNotFoundFail(id: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "Id" = $1 AND "DeletionStatus" != 'PermanentDeleted'`,
      [id],
    );

    if (!user.length) {
      throw new NotFoundException('User not found');
    }
    return user[0];
  }

  async getUserByLogin(login: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "Login" = $1 AND "DeletionStatus" != 'PermanentDeleted'`,
      [login],
    );
    return user.length ? user[0] : null;
  }

  async getUserByEmail(email: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" u
                         JOIN "UserMeta" um ON u."Id" = um."UserId"
       WHERE "Email" = $1
         AND "DeletionStatus" != 'PermanentDeleted'`,
      [email],
    );
    return user.length ? user[0] : null;
  }

  async getUserByRecoveryCode(code: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" u
                         JOIN "UserMeta" um ON u."Id" = um."UserId"
       WHERE um."PasswordRecoveryCode" = $1
         AND u."DeletionStatus" != 'PermanentDeleted'`,
      [code],
    );
    return user.length ? user[0] : null;
  }

  async getUserByConfirmationCode(code: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" u 
      JOIN "UserMeta" um ON u."Id" = um."UserId" 
      WHERE um."EmailConfirmationCode" = $1 AND u."DeletionStatus" != 'PermanentDeleted'`,
      [code],
    );
    return user.length ? user[0] : null;
  }

  async getUserByLoginOrEmail(loginOrEmail: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE ("Login" = $1 OR "Email" = $1) AND "DeletionStatus" != 'PermanentDeleted'`,
      [loginOrEmail],
    );
    return user.length ? user[0] : null;
  }

  async createUser(dto: CreateUserDomainDto) {
    // Создаем пользователя и получаем его данные
    const user = await this.dataSource.query(
      `INSERT INTO "Users" ("Login", "Email", "PasswordHash")
       VALUES ($1, $2, $3) RETURNING *;`,
      [dto.login, dto.email, dto.passwordHash],
    );

    const userId = user[0].Id;

    // Создаем запись в таблице UserMeta с дефолтными значениями для остальных полей
    await this.dataSource.query(
      `INSERT INTO "UserMeta" ("UserId")
     VALUES ($1);`,
      [userId],
    );

    return user[0];
  }

  async makeDeleted(id: string) {
    const result = await this.dataSource.query(
      `UPDATE "Users"
       SET "DeletionStatus" = 'PermanentDeleted'
       WHERE "Id" = $1 AND "DeletionStatus" = 'NotDeleted'
       RETURNING *;`,
      [id],
    );

    if (!result.length) {
      throw new Error('User already deleted or not found');
    }
    return result[0];
  }

  async updatePasswordHash(id: string, newPasswordHash: string) {
    const query = `
        UPDATE "Users"
        SET "PasswordHash" = $1, "UpdatedAt" = NOW()
        WHERE "Id" = $2 AND "DeletionStatus" != 'PermanentDeleted'
        RETURNING *;
    `;

    const result = await this.dataSource.query(query, [newPasswordHash, id]);

    if (!result.length) {
      throw new NotFoundException('User not found or already deleted');
    }

    return result[0];
  }

  async setPasswordRecoveryCode(userId: string, code: string) {
    const expirationDate = add(new Date(), { minutes: 5 });

    const result = await this.dataSource.query(
      `UPDATE "UserMeta"
       SET "PasswordRecoveryCode" = $1, "PasswordRecoveryExpiration" = $2
       WHERE "UserId" = $3
       RETURNING *;`,
      [code, expirationDate, userId],
    );

    if (!result.length) {
      throw new NotFoundException('User not found or UserMeta not found');
    }

    return result[0];
  }

  async setEmailConfirmationCode(userId: string, code: string) {
    const expirationDate = add(new Date(), { minutes: 5 });

    const result = await this.dataSource.query(
      `UPDATE "UserMeta"
     SET "EmailConfirmationCode" = $1, "EmailConfirmationExpiration" = $2
     WHERE "UserId" = $3
     RETURNING *;`,
      [code, expirationDate, userId],
    );

    if (!result.length) {
      throw new NotFoundException('User not found or UserMeta not found');
    }

    return result[0];
  }

  async updateEmailConfirmationStatus(userId: string) {
    const result = await this.dataSource.query(
      `UPDATE "UserMeta"
         SET "IsEmailConfirmed" = true
         WHERE "UserId" = $1 RETURNING *;`,
      [userId],
    );

    if (!result.length) {
      throw new NotFoundException('User not found or UserMeta not found');
    }

    return result[0];
  }
}
