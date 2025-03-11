import { PasswordRecoveryDto } from '../../dto/password-recovery.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../notifications/email.service';
import { UsersRepository } from '../../infrastructure/users.repository';

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

    await this.usersRepository.setPasswordRecoveryCode(user.Id, confirmCode);

    this.emailService.sendPasswordRecoveryEmail(user.Email, confirmCode);
  }
}
