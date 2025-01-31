import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../core/exceptions/filters/all-exceptions-filter';
import { DomainExceptionsFilter } from '../core/exceptions/filters/domain-exceptions-filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(
    app.get(AllExceptionsFilter),
    new DomainExceptionsFilter(),
  );
}
