import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Post } from '../../../posts/domain/post.entity';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public dto: Omit<CreatePostDto, 'blogId'>,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({ blogId, dto }: CreatePostForBlogCommand): Promise<string> {
    const post = Post.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
    });

    await this.postsRepository.save(post);

    return post.id.toString();
  }
}
