import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { RefreshTokenDataDto } from '../dto/refresh-token-data.dto';
import jwt from 'jsonwebtoken';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.PasswordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.Id.toString() };
  }

  async getRefreshTokenData(
    refreshToken: string,
  ): Promise<RefreshTokenDataDto> {
    try {
      const decoded: any = jwt.decode(refreshToken);

      if (!decoded) {
        throw new Error('Invalid or malformed refresh token');
      }

      return {
        deviceId: decoded.deviceId,
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000),
      };
    } catch (error) {
      console.error('Error decoding refresh token:', error);
      throw new Error('Error decoding refresh token');
    }
  }
}
