import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog = await this.blogsRepository.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return blog.Id.toString();
  }
}
