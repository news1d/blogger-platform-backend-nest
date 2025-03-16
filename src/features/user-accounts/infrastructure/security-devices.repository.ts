import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { DeletionStatus } from '../../../core/dto/deletion-status';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from '../domain/device.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
  ) {}

  async getAllOtherDevicesByUserId(
    userId: string,
    deviceId: string,
  ): Promise<Device[]> {
    return this.deviceRepository.findBy({
      userId: +userId,
      id: Not(deviceId),
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async getDeviceByIdAndUserIdOrFails(
    userId: string,
    deviceId: string,
  ): Promise<Device> {
    const device = await this.deviceRepository.findOneBy({
      id: deviceId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (userId !== device.userId.toString()) {
      throw new ForbiddenException("Trying to get another user's device");
    }

    return device;
  }

  async getDeviceById(deviceId: string): Promise<Device | null> {
    return this.deviceRepository.findOneBy({
      id: deviceId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async save(device: Device) {
    return this.deviceRepository.save(device);
  }
}
