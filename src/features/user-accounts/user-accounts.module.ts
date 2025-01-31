import { Global, Module } from '@nestjs/common';
import { AuthConfig } from './config/auth.config';
import { JwtConfig } from './config/jwt.config';

@Global()
@Module({
  providers: [AuthConfig, JwtConfig],
  exports: [AuthConfig, JwtConfig],
})
export class UserModule {}
