import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TerminateDeviceCommand } from './terminate-device.usecase';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';
import { Blacklist } from '../../domain/blacklist.entity';

export class LogoutUserCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private blacklistRepository: BlacklistRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ userId, deviceId, refreshToken }: LogoutUserCommand) {
    const blacklistedRefreshToken = Blacklist.createInstance(refreshToken);

    await this.blacklistRepository.save(blacklistedRefreshToken);

    await this.commandBus.execute<TerminateDeviceCommand>(
      new TerminateDeviceCommand(userId, deviceId),
    );
  }
}
