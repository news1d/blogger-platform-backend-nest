import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../../notifications/email.service';
import { NewPasswordRecoveryDto } from '../dto/password-recovery.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.getUserByLogin(
      dto.login,
    );

    if (!!userWithTheSameLogin) {
      throw BadRequestDomainException.create(
        'This login has already been used',
        'login',
      );
    }

    const userWithTheSameEmail = await this.usersRepository.getUserByEmail(
      dto.email,
    );

    if (!!userWithTheSameEmail) {
      throw BadRequestDomainException.create(
        'This email address has already been used',
        'email',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.getUserByIdOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const createdUserId = await this.createUser(dto);

    const confirmCode = randomUUID().toString();

    const user =
      await this.usersRepository.getUserByIdOrNotFoundFail(createdUserId);

    user.setEmailConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }

  async newPassword(dto: NewPasswordRecoveryDto): Promise<void> {
    const user = await this.usersRepository.getUserByRecoveryCode(
      dto.recoveryCode,
    );

    if (!user || user.passwordRecovery.recoveryCode !== dto.recoveryCode) {
      throw BadRequestDomainException.create(
        'Recovery code incorrect',
        'recoveryCode',
      );
    }

    if (user.passwordRecovery.expirationDate! < new Date()) {
      throw BadRequestDomainException.create(
        'Recovery code expired',
        'recoveryCode',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.newPassword,
    );

    user.updatePasswordHash(passwordHash);
    await this.usersRepository.save(user);
  }
}
