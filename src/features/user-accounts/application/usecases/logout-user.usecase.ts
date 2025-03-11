import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TerminateDeviceCommand } from './terminate-device.usecase';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';

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
    await this.blacklistRepository.addToken(refreshToken);

    await this.commandBus.execute<TerminateDeviceCommand>(
      new TerminateDeviceCommand(userId, deviceId),
    );
  }
}
