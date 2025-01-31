import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception-filter';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  onCatch(exception: unknown, response: Response): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        ...this.getDefaultHttpBody(exception),
        message: 'Some error occurred',
      });

      return;
    }

    response.status(status).json(this.getDefaultHttpBody(exception));
  }
}
