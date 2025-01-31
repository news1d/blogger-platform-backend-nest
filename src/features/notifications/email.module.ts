import { Global, Module } from '@nestjs/common';
import { EmailConfig } from './email.config';

@Global()
@Module({
  providers: [EmailConfig],
  exports: [EmailConfig],
})
export class EmailModule {}
