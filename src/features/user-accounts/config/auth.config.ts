import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../core/config-validation.utility';

@Injectable()
export class AuthConfig {
  @IsNotEmpty({
    message: 'Set ENV variable BASIC_AUTH_USERNAME',
  })
  authUsername: string = this.configService.get('BASIC_AUTH_USERNAME');

  @IsNotEmpty({
    message: 'Set ENV variable BASIC_AUTH_PASSWORD',
  })
  authPassword: string = this.configService.get('BASIC_AUTH_PASSWORD');

  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
