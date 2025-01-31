import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogPost, PostDocument, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(BlogPost.name) private PostModel: PostModelType) {}

  async save(post: PostDocument) {
    await post.save();
  }

  async getPostByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }
}
