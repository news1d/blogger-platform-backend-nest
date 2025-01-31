import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BlogPost, PostModelType } from '../../../posts/domain/post.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public blogName: string,
    public dto: Omit<CreatePostDto, 'blogId'>,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand>
{
  constructor(
    @InjectModel(BlogPost.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async execute({
    blogId,
    blogName,
    dto,
  }: CreatePostForBlogCommand): Promise<string> {
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blogName,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }
}
