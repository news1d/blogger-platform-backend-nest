import { CreatePostDto } from '../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(public dto: Omit<CreatePostDto, 'blogName'>) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
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
