import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Device, DeviceModelType } from '../../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from '../auth.service';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

export class LoginUserCommand {
  constructor(
    public userId: string,
    public deviceName: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private authService: AuthService,
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute({
    userId,
    deviceName,
    ip,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const deviceId = uuidv4();
    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: deviceId,
    });

    const tokenData = await this.authService.getRefreshTokenData(refreshToken);

    // const device = this.DeviceModel.createInstance({
    //   userId: userId,
    //   deviceId: tokenData.deviceId,
    //   issuedAt: tokenData.issuedAt,
    //   deviceName: deviceName,
    //   ip: ip,
    //   expiresAt: tokenData.expiresAt,
    // });

    await this.securityDevicesRepository.createDevice({
      userId: userId,
      deviceId: tokenData.deviceId,
      issuedAt: tokenData.issuedAt,
      deviceName: deviceName,
      ip: ip,
      expiresAt: tokenData.expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
