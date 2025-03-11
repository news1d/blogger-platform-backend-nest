import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    await this.usersRepository.getUserByIdOrNotFoundFail(id);
    await this.usersRepository.makeDeleted(id);
  }
}
