import { Device } from '../../domain/device.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(device: Device): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = device.ip;
    dto.title = device.deviceName;
    dto.lastActiveDate = device.issuedAt;
    dto.deviceId = device.id;

    return dto;
  }
}
