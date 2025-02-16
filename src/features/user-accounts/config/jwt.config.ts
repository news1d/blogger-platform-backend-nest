import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../core/config-validation.utility';

@Injectable()
export class JwtConfig {
  @IsNotEmpty({
    message: 'Set ENV variable JWT_SECRET',
  })
  jwtSecret: string = this.configService.get('JWT_SECRET');

  @IsNotEmpty({
    message: 'Set ENV variable REFRESH_SECRET',
  })
  refreshSecret: string = this.configService.get('REFRESH_SECRET');

  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }
}
