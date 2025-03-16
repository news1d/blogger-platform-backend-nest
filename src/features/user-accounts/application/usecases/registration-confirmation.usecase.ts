import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ code }: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);

    if (!user || user.userMeta.emailConfirmationCode !== code) {
      throw BadRequestDomainException.create(
        'Verification code incorrect',
        'code',
      );
    }

    if (user.userMeta.isEmailConfirmed) {
      throw BadRequestDomainException.create(
        'The account has already been confirmed',
        'code',
      );
    }

    if (user.userMeta.emailConfirmationExpiration! < new Date()) {
      throw BadRequestDomainException.create(
        'Verification code expired',
        'code',
      );
    }

    user.updateEmailConfirmationStatus();
    await this.usersRepository.save(user);
  }
}
