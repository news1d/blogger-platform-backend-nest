import { PasswordRecoveryDto } from '../../dto/password-recovery.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../notifications/email.service';

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.getUserByEmail(dto.email);

    if (!user) {
      return;
    }
    const confirmCode = randomUUID().toString();

    user.setPasswordRecoveryCode(confirmCode);
    await this.usersRepository.save(user);

    await this.emailService
      .sendPasswordRecoveryEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
