import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../core/dto/deletion-status';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async save(device: DeviceDocument) {
    await device.save();
  }

  async getAllDevicesByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeviceDocument[]> {
    return this.DeviceModel.find({
      userId,
      deviceId: { $ne: deviceId },
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getDeviceByIdAndUserIdOrFails(
    userId: string,
    deviceId: string,
  ): Promise<DeviceDocument> {
    const device = await this.DeviceModel.findOne({
      deviceId: deviceId,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (userId != device.userId) {
      throw new ForbiddenException(`Trying to get another user's device`);
    }

    return device;
  }

  async getDeviceById(deviceId: string): Promise<DeviceDocument | null> {
    return this.DeviceModel.findOne({
      deviceId: deviceId,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }
}
