import { CreatePostDto } from '../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BlogPost, PostModelType } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class CreatePostCommand {
  constructor(public dto: Omit<CreatePostDto, 'blogName'>) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(BlogPost.name) private PostModel: PostModelType,
    private blogsRepository: BlogsSqlRepository,
    private postsRepository: PostsSqlRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const blog = await this.blogsRepository.getBlogByIdOrNotFoundFail(
      dto.blogId,
    );

    const post = await this.postsRepository.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    return post.Id.toString();
  }
}
