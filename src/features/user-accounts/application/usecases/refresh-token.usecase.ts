import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';
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
    await this.blacklistRepository.addToken(refreshToken);

    const newAccessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const newRefreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: deviceId,
    });

    const tokenData =
      await this.authService.getRefreshTokenData(newRefreshToken);

    await this.securityDevicesRepository.getDeviceByIdAndUserIdOrFails(
      userId,
      deviceId,
    );

    await this.securityDevicesRepository.updateTokenData(
      deviceId,
      tokenData.issuedAt,
      tokenData.expiresAt,
    );

    return { newAccessToken, newRefreshToken };
  }
}
