import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsSqlRepository) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    await this.postsRepository.getPostByIdOrNotFoundFail(id);
    await this.postsRepository.makeDeleted(id);
  }
}
