import { CoreConfig } from './core.config';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [CoreConfig],
  exports: [CoreConfig],
})
export class CoreModule {}
