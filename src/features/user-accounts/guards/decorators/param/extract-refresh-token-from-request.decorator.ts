import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenContextDto } from '../../dto/refreshToken-context.dto';

export const ExtractRefreshTokenFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): RefreshTokenContextDto => {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.get('Authorization');
    if (!authHeader) {
      throw new Error('there is no authHeader in the request object!');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();

    return refreshToken;
  },
);
