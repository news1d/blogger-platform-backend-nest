import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public blogName: string,
    public dto: Omit<CreatePostDto, 'blogId' | 'blogName'>,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({
    blogId,
    blogName,
    dto,
  }: CreatePostForBlogCommand): Promise<string> {
    const post = await this.postsRepository.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blogName,
    });

    return post.Id.toString();
  }
}
