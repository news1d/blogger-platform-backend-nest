import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { CreateUserInputDto, EmailInputDto } from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { ApiBearerAuth, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import {
  NewPasswordRecoveryInputDto,
  PasswordRecoveryInputDto,
} from './input-dto/password-recovery.input-dto';
import { VerificationCodeInputDTO } from './input-dto/verification-code.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { UpdatePasswordCommand } from '../application/usecases/update-password.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery.usecase';
import { RegistrationConfirmationCommand } from '../application/usecases/registration-confirmation.usecase';
import { RegistrationEmailResendingCommand } from '../application/usecases/registration-email-resending.usecase';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from '../guards/bearer/refresh-token-auth.guard';
import { ExtractDeviceFromCookie } from '../guards/decorators/param/extract-device-from-request.decorator';
import { DeviceContextDto } from '../guards/dto/device-context.dto';
import { ExtractRefreshTokenFromCookie } from '../guards/decorators/param/extract-refresh-token-from-request.decorator';
import { RefreshTokenContextDto } from '../guards/dto/refreshToken-context.dto';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';
import { RefreshTokenCommand } from '../application/usecases/refresh-token.usecase';
import { seconds, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  //swagger doc
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deviceName = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'unknown';

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginUserCommand(user.id, deviceName, ip),
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.json({ accessToken: accessToken });
  }

  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @ExtractUserFromRequest() user: UserContextDto,
    @ExtractDeviceFromCookie() device: DeviceContextDto,
    @ExtractRefreshTokenFromCookie() refreshToken: RefreshTokenContextDto,
    @Res() res: Response,
  ) {
    const { newAccessToken, newRefreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(user.id, device.id, refreshToken.token),
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.json({ accessToken: newAccessToken });
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new PasswordRecoveryCommand(body));
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordRecoveryInputDto): Promise<void> {
    return this.commandBus.execute(new UpdatePasswordCommand(body));
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: VerificationCodeInputDTO,
  ): Promise<void> {
    return this.commandBus.execute(
      new RegistrationConfirmationCommand(body.code),
    );
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailInputDto): Promise<void> {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(body.email),
    );
  }

  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @ExtractUserFromRequest() user: UserContextDto,
    @ExtractDeviceFromCookie() device: DeviceContextDto,
    @ExtractRefreshTokenFromCookie() refreshToken: RefreshTokenContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new LogoutUserCommand(user.id, device.id, refreshToken.token),
    );
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }
}
