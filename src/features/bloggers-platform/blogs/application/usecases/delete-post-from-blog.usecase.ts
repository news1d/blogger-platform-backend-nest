import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

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
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
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
