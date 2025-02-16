import { Injectable } from '@nestjs/common';
import { Device, DeviceModelType } from '../../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}

  async getAllDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.DeviceModel.find({
      userId: userId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return devices.map(DeviceViewDto.mapToView);
  }
}
