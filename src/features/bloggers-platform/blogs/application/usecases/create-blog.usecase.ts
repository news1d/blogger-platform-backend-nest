import { CreateBlogDto } from '../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsSqlRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog = await this.blogsRepository.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return blog.Id.toString();
  }
}
