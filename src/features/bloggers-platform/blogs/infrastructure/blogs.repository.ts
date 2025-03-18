import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { Blog } from '../domain/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async getBlogByIdOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.blogsRepository.findOneBy({
      id: +id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async getBlogById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({
      id: +id,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async save(blog: Blog) {
    return this.blogsRepository.save(blog);
  }
}
