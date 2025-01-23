import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto, EmailInputDto } from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Nullable, UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/param/extract-user-if-exists-from-request.decorator';
import {
  NewPasswordRecoveryInputDto,
  PasswordRecoveryInputDto,
} from './input-dto/password-recovery.input-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

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
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() body: PasswordRecoveryInputDto,
  ): Promise<void> {
    return this.authService.passwordRecovery(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordRecoveryInputDto): Promise<void> {
    return this.usersService.newPassword(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: { code: string },
  ): Promise<void> {
    return this.authService.registrationConfirmation(body.code);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailInputDto): Promise<void> {
    return this.authService.registrationEmailResending(body.email);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  // @ApiBearerAuth()
  // @Get('me-or-default')
  // @UseGuards(JwtOptionalAuthGuard)
  // async meOrDefault(
  //   @ExtractUserIfExistsFromRequest() user: UserContextDto,
  // ): Promise<Nullable<MeViewDto>> {
  //   if (user) {
  //     return this.authQueryRepository.me(user.id!);
  //   } else {
  //     return {
  //       login: 'anonymous',
  //       userId: null,
  //       email: null,
  //     };
  //   }
  // }
}
