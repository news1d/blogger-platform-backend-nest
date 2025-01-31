import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';
import { JwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtConfig: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.jwtSecret,
    });
  }

  async validate(payload: UserContextDto): Promise<UserContextDto> {
    return payload;
  }
}
