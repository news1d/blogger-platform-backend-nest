import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
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
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({
    blogId,
    postId,
    dto,
  }: UpdatePostFromBlogCommand): Promise<void> {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(blogId);
    const post = await this.postsRepository.getPostByIdAndBlogIdOrNotFoundFail(
      blogId,
      postId,
    );

    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
    });

    await this.postsRepository.save(post);
  }
}
