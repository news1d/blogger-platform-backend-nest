import { INestApplication, ValidationPipe } from '@nestjs/common';

import { ValidationError } from '@nestjs/common';
import { BadRequestDomainException } from '../core/exceptions/domain-exceptions';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/object-id-validation-transformation-pipe.service';

type ErrorResponse = { message: string; field: string };

export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
): ErrorResponse[] => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error?.constraints && error?.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error?.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new BadRequestDomainException(formattedErrors);
      },
    }),
  );
}
