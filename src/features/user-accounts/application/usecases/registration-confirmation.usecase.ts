import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
}
