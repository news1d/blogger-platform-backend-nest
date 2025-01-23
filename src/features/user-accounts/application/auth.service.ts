import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../../notifications/email.service';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { PasswordRecoveryDto } from '../dto/password-recovery.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private emailService: EmailService,
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
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }

  async passwordRecovery(dto: PasswordRecoveryDto): Promise<void> {
    const user = await this.usersRepository.getUserByEmail(dto.email);

    if (!user) {
      return;
    }
    const confirmCode = randomUUID().toString();

    user.setPasswordRecoveryCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendPasswordRecoveryEmail(user.email, confirmCode)
      .catch(console.error);
  }

  async registrationConfirmation(code: string): Promise<void> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);

    if (!user || user.emailConfirmation.confirmationCode !== code) {
      throw BadRequestDomainException.create(
        'Verification code incorrect',
        'code',
      );
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        'The account has already been confirmed',
        'code',
      );
    }

    if (user.emailConfirmation.expirationDate! < new Date()) {
      throw BadRequestDomainException.create(
        'Verification code expired',
        'code',
      );
    }

    user.updateEmailConfirmationStatus();
    await this.usersRepository.save(user);
  }

  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersRepository.getUserByEmail(email);

    if (!user) {
      throw BadRequestDomainException.create(
        'The user does not exist',
        'email',
      );
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        'Email is already confirmed',
        'email',
      );
    }

    const confirmCode = randomUUID().toString();

    user.setEmailConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
