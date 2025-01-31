import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { randomUUID } from 'crypto';
import { CreateUserCommand } from './create-user.usecase';
import { EmailService } from '../../../notifications/email.service';

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
    const createdUserId = await this.commandBus.execute<CreateUserCommand>(
      new CreateUserCommand(dto),
    );

    const confirmCode = randomUUID().toString();

    const user =
      await this.usersRepository.getUserByIdOrNotFoundFail(createdUserId);

    user.setEmailConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
