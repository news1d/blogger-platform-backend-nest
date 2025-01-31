import { UpdatePostDto } from '../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.getPostByIdOrNotFoundFail(id);

    post.update(dto);

    await this.postsRepository.save(post);
  }
}
