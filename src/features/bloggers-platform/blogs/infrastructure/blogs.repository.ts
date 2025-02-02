import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async getBlogByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async getBlogById(id: string): Promise<BlogDocument | null> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!blog) {
      return null;
    }

    return blog;
  }
}
