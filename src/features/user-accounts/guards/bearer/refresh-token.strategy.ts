import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtConfig } from '../../config/jwt.config';
import { UserContextDto } from '../dto/user-context.dto';
import { BlacklistQueryRepository } from '../../infrastructure/query/blacklist.query-repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private jwtConfig: JwtConfig,
    private blacklistQueryRepository: BlacklistQueryRepository,
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

  async validate(
    req: Request,
    payload: UserContextDto,
  ): Promise<UserContextDto> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const isBlacklisted =
      await this.blacklistQueryRepository.getToken(refreshToken);

    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    return payload;
  }
}
