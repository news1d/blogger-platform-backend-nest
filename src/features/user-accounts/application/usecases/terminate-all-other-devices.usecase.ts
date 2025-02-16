import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

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
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

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
      device.makeDeleted();
      await this.securityDevicesRepository.save(device);
    }
  }
}
