import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: RegistrationEmailResendingCommand): Promise<void> {
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

    this.emailService.sendConfirmationEmail(user.email, confirmCode);
  }
}
