import { UpdateBlogDto } from '../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.getBlogByIdOrNotFoundFail(id);
    await this.blogsRepository.update(blog.Id, dto);
  }
}
