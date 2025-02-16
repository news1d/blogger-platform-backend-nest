import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blacklist, BlacklistModelType } from '../../domain/blacklist.entity';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @InjectModel(Blacklist.name) private BlacklistModel: BlacklistModelType,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private blacklistRepository: BlacklistRepository,
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({
    userId,
    deviceId,
    refreshToken,
  }: RefreshTokenCommand): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
  }> {
    const blacklistedRefreshToken =
      this.BlacklistModel.createInstance(refreshToken);

    await this.blacklistRepository.save(blacklistedRefreshToken);

    const newAccessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const newRefreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: deviceId,
    });

    const tokenData =
      await this.authService.getRefreshTokenData(newRefreshToken);

    const device =
      await this.securityDevicesRepository.getDeviceByIdAndUserIdOrFails(
        userId,
        deviceId,
      );

    device.updateTokenData(tokenData.issuedAt, tokenData.expiresAt);

    await this.securityDevicesRepository.save(device);

    return { newAccessToken, newRefreshToken };
  }
}
