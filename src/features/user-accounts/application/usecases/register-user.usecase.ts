import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateUserCommand } from './create-user.usecase';
import { EmailService } from '../../../notifications/email.service';
import { UsersRepository } from '../../infrastructure/users.repository';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const userId = await this.commandBus.execute<CreateUserCommand>(
      new CreateUserCommand(dto),
    );

    const confirmCode = randomUUID().toString();

    const user = await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    await this.usersRepository.setEmailConfirmationCode(user.Id, confirmCode);

    this.emailService.sendConfirmationEmail(user.Email, confirmCode);
  }
}
