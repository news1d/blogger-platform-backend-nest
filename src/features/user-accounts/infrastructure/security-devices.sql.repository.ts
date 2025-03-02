import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm'; // используем DataSource от TypeORM
import { DeletionStatus } from '../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { CreateDeviceDomainDto } from '../domain/dto/create-device.domain.dto';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllDevicesByUserIdAndDeviceId(userId: string, deviceId: string) {
    const query = `
      SELECT * FROM "Devices"
      WHERE "UserId" = $1
      AND "DeviceId" != $2
      AND "DeletionStatus" != $3
    `;
    const result = await this.dataSource.query(query, [
      userId,
      deviceId,
      DeletionStatus.PermanentDeleted,
    ]);
    return result;
  }

  async getDeviceByIdAndUserIdOrFails(userId: string, deviceId: string) {
    const query = `
      SELECT * FROM "Devices"
      WHERE "DeviceId" = $1
      AND "DeletionStatus" != $2
    `;
    const result = await this.dataSource.query(query, [
      deviceId,
      DeletionStatus.PermanentDeleted,
    ]);

    const device = result[0];

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (userId !== device.UserId.toString()) {
      throw new ForbiddenException("Trying to get another user's device");
    }

    return device;
  }

  async getDeviceById(deviceId: string) {
    const query = `
      SELECT * FROM "Devices"
      WHERE "DeviceId" = $1
      AND "DeletionStatus" != $2
    `;
    const result = await this.dataSource.query(query, [
      deviceId,
      DeletionStatus.PermanentDeleted,
    ]);

    return result[0] || null;
  }

  async createDevice(dto: CreateDeviceDomainDto) {
    const query = `
        INSERT INTO "Devices" ("UserId", "DeviceId", "IssuedAt", "DeviceName", "Ip", "ExpiresAt")
        VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "DeviceId";
    `;
    const result = await this.dataSource.query(query, [
      dto.userId,
      dto.deviceId,
      dto.issuedAt,
      dto.deviceName,
      dto.ip,
      dto.expiresAt,
    ]);

    return result[0].DeviceId;
  }

  async updateTokenData(deviceId: string, issuedAt: Date, expiresAt: Date) {
    const query = `
    UPDATE "Devices"
    SET "IssuedAt" = $1, "ExpiresAt" = $2
    WHERE "DeviceId" = $3
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [
      issuedAt,
      expiresAt,
      deviceId,
    ]);

    return result[0];
  }

  async makeDeleted(deviceId: string) {
    const query = `
    UPDATE "Devices"
    SET "DeletionStatus" = $1
    WHERE "DeviceId" = $2 AND "DeletionStatus" = $3
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [
      DeletionStatus.PermanentDeleted,
      deviceId,
      DeletionStatus.NotDeleted,
    ]);

    if (!result.length) {
      throw new Error('Device already deleted or not found');
    }

    return result[0];
  }
}
