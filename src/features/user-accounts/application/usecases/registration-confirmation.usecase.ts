import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute({ code }: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);

    if (!user || user.EmailConfirmationCode !== code) {
      throw BadRequestDomainException.create(
        'Verification code incorrect',
        'code',
      );
    }

    if (user.IsEmailConfirmed) {
      throw BadRequestDomainException.create(
        'The account has already been confirmed',
        'code',
      );
    }

    if (user.EmailConfirmationExpiration! < new Date()) {
      throw BadRequestDomainException.create(
        'Verification code expired',
        'code',
      );
    }

    await this.usersRepository.updateEmailConfirmationStatus(user.Id);
  }
}
