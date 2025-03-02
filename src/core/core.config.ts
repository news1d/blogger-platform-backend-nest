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

  @IsNotEmpty({
    message: 'Set ENV variable DB_HOST',
  })
  dbHost: string = this.configService.get('DB_HOST');

  @IsNumber({}, { message: 'Set ENV variable DB_PORT' })
  dbPort: number = Number(this.configService.get('DB_PORT'));

  @IsNotEmpty({
    message: 'Set ENV variable DB_USER',
  })
  dbUser: string = this.configService.get('DB_USER');

  @IsNotEmpty({
    message: 'Set ENV variable DB_PASSWORD',
  })
  dbPassword: string = this.configService.get('DB_PASSWORD');

  @IsNotEmpty({
    message: 'Set ENV variable DB_NAME',
  })
  dbName: string = this.configService.get('DB_NAME');

  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }
}
