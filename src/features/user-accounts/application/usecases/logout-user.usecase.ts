import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blacklist, BlacklistModelType } from '../../domain/blacklist.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';
import { TerminateDeviceCommand } from './terminate-device.usecase';
import { BlacklistSqlRepository } from '../../infrastructure/blacklist.sql.repository';

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
    @InjectModel(Blacklist.name) private BlacklistModel: BlacklistModelType,
    private blacklistRepository: BlacklistSqlRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ userId, deviceId, refreshToken }: LogoutUserCommand) {
    // const blacklistedRefreshToken =
    //   this.BlacklistModel.createInstance(refreshToken);

    await this.blacklistRepository.addToken(refreshToken);

    await this.commandBus.execute<TerminateDeviceCommand>(
      new TerminateDeviceCommand(userId, deviceId),
    );
  }
}
