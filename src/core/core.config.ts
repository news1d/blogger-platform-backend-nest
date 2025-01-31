import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from './config-validation.utility';

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set ENV variable PORT' })
  port: number = Number(this.configService.get('PORT'));
  @IsNotEmpty({
    message: 'Set ENV variable MONGO_URI',
  })
  mongoURI: string = this.configService.get('MONGO_URI');

  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
