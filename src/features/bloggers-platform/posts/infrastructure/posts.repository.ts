import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getPostByIdOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.postsRepository.findOneBy({
      id: +id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPostByIdAndBlogIdOrNotFoundFail(blogId: string, postId: string) {
    const post = await this.postsRepository.findOneBy({
      id: +postId,
      blogId: +blogId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) {
      throw new NotFoundException(
        'Post not found or does not belong to the specified blog',
      );
    }

    return post;
  }

  async save(post: Post) {
    return this.postsRepository.save(post);
  }
}
