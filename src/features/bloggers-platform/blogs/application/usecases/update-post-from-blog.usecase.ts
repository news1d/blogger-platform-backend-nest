import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts.sql.repository';
import { UpdatePostDto } from '../../../posts/dto/create-post.dto';

export class UpdatePostFromBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public dto: Omit<UpdatePostDto, 'blogId'>,
  ) {}
}

@CommandHandler(UpdatePostFromBlogCommand)
export class UpdatePostFromBlogUseCase
  implements ICommandHandler<UpdatePostFromBlogCommand>
{
  constructor(
    private blogsRepository: BlogsSqlRepository,
    private postsRepository: PostsSqlRepository,
  ) {}

  async execute({
    blogId,
    postId,
    dto,
  }: UpdatePostFromBlogCommand): Promise<void> {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(blogId);
    await this.postsRepository.getPostByIdAndBlogIdOrNotFoundFail(
      blogId,
      postId,
    );
    await this.postsRepository.update(postId, {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
    });
  }
}
