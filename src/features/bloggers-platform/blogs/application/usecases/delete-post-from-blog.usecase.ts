import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts.sql.repository';

export class DeletePostFromBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostFromBlogCommand)
export class DeletePostFromBlogUseCase
  implements ICommandHandler<DeletePostFromBlogCommand>
{
  constructor(
    private blogsRepository: BlogsSqlRepository,
    private postsRepository: PostsSqlRepository,
  ) {}

  async execute({ blogId, postId }: DeletePostFromBlogCommand): Promise<void> {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(blogId);
    await this.postsRepository.getPostByIdAndBlogIdOrNotFoundFail(
      blogId,
      postId,
    );
    await this.postsRepository.makeDeleted(postId);
  }
}
