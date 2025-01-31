import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../core/config-validation.utility';

@Injectable()
export class EmailConfig {
  @IsNotEmpty({
    message: 'Set ENV variable EMAIL',
  })
  @IsEmail()
  emailAddress: string = this.configService.get('EMAIL');

  @IsNotEmpty({
    message: 'Set ENV variable PASSWORD',
  })
  emailPassword: string = this.configService.get('PASSWORD');

  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
