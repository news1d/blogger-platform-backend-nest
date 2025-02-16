import { DeviceDocument } from '../../domain/device.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActivate: Date;
  deviceId: string;

  static mapToView(device: DeviceDocument): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = device.ip;
    dto.title = device.deviceName;
    dto.lastActivate = device.expiresAt;
    dto.deviceId = device.deviceId;

    return dto;
  }
}
