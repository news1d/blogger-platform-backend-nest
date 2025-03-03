import { DeviceDocument } from '../../domain/device.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(device): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = device.Ip;
    dto.title = device.DeviceName;
    dto.lastActiveDate = device.IssuedAt;
    dto.deviceId = device.Id;

    return dto;
  }
}
