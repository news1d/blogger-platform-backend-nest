import { DeviceDocument } from '../../domain/device.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(device: DeviceDocument): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = device.ip;
    dto.title = device.deviceName;
    dto.lastActiveDate = device.expiresAt;
    dto.deviceId = device.deviceId;

    return dto;
  }
}
