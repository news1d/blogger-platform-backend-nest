import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    await this.usersRepository.getUserByIdOrNotFoundFail(id);
    await this.usersRepository.makeDeleted(id);

    // await this.usersRepository.save(user);
  }
}
