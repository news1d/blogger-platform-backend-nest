import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllDevices(userId: string): Promise<DeviceViewDto[]> {
    const query = `
      SELECT * FROM "Devices"
      WHERE "UserId" = $1
      AND "DeletionStatus" = $2
    `;
    const result = await this.dataSource.query(query, [
      userId,
      DeletionStatus.NotDeleted,
    ]);

    return result.map(DeviceViewDto.mapToView);
  }
}
