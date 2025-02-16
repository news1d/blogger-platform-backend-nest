import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenContextDto } from '../../dto/refreshToken-context.dto';

export const ExtractRefreshTokenFromCookie = createParamDecorator(
  (data: unknown, context: ExecutionContext): RefreshTokenContextDto => {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token is missing in cookies!');
    }

    return { token: refreshToken };
  },
);
