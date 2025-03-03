import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

export class TerminateDeviceCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateDeviceCommand)
export class TerminateDeviceUseCase
  implements ICommandHandler<TerminateDeviceCommand>
{
  constructor(
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute({ userId, deviceId }: TerminateDeviceCommand) {
    const device =
      await this.securityDevicesRepository.getDeviceByIdAndUserIdOrFails(
        userId,
        deviceId,
      );

    await this.securityDevicesRepository.makeDeleted(device.Id);
  }
}
