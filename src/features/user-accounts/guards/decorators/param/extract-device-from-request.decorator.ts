import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { DeviceContextDto } from '../../dto/device-context.dto';

export const ExtractDeviceFromCookie = createParamDecorator(
  (data: unknown, context: ExecutionContext): DeviceContextDto => {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token is missing in cookies!');
    }

    try {
      const decoded: any = jwt.decode(refreshToken);

      if (!decoded) {
        throw new Error('Invalid or malformed refresh token!');
      }

      return {
        id: decoded.deviceId,
      };
    } catch (error) {
      console.error('Error decoding refresh token:', error);
      throw new Error('Error decoding refresh token');
    }
  },
);
