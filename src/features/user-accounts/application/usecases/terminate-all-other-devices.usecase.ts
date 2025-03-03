import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

export class TerminateAllOtherDevicesCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(TerminateAllOtherDevicesCommand)
export class TerminateAllOtherDevicesUseCase
  implements ICommandHandler<TerminateAllOtherDevicesCommand>
{
  constructor(
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute({
    userId,
    deviceId,
  }: TerminateAllOtherDevicesCommand): Promise<void> {
    const devices =
      await this.securityDevicesRepository.getAllDevicesByUserIdAndDeviceId(
        userId,
        deviceId,
      );

    for (const device of devices) {
      await this.securityDevicesRepository.makeDeleted(device.Id);
    }
  }
}
