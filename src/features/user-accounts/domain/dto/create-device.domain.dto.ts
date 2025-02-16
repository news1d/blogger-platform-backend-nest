export class CreateDeviceDomainDto {
  userId: string;
  deviceId: string;
  issuedAt: Date;
  deviceName: string;
  ip: string;
  expiresAt: Date;
}
