import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BlogPost, PostModelType } from '../../../posts/domain/post.entity';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts.sql.repository';

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
  constructor(
    @InjectModel(BlogPost.name) private PostModel: PostModelType,
    private postsRepository: PostsSqlRepository,
  ) {}

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
