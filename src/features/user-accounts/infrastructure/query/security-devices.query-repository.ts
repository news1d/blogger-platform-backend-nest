import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../../domain/device.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
  ) {}

  async getAllDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.deviceRepository.findBy({
      userId: +userId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return devices.map(DeviceViewDto.mapToView);
  }
}
