import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtConfig } from '../../config/jwt.config';
import { UserContextDto } from '../dto/user-context.dto';
import { AuthService } from '../../application/auth.service';
import { BlacklistRepository } from '../../infrastructure/blacklist.repository';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private jwtConfig: JwtConfig,
    private blacklistRepository: BlacklistRepository,
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken, // Берём токен из куков
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, user: UserContextDto): Promise<UserContextDto> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const isBlacklisted = await this.blacklistRepository.getToken(refreshToken);

    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const tokenData = await this.authService.getRefreshTokenData(refreshToken);
    const device = await this.securityDevicesRepository.getDeviceById(
      tokenData.deviceId,
    );

    if (!device) {
      throw new UnauthorizedException('Device not found');
    }

    return user;
  }
}
