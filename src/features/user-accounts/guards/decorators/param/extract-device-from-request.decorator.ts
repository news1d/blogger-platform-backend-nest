import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { DeviceContextDto } from '../../dto/device-context.dto';

export const ExtractDeviceFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): DeviceContextDto => {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.get('Authorization');
    if (!authHeader) {
      throw new Error('there is no authHeader in the request object!');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();

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
