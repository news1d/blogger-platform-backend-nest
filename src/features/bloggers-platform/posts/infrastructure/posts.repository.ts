import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { Post } from '../domain/post.entity';
import { PostLike } from '../domain/post-like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getPostByIdOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: {
        id: +id,
        deletionStatus: DeletionStatus.NotDeleted,
      },
      relations: { likes: true },
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

  async save(post: Post | PostLike) {
    return this.dataSource.createEntityManager().save(post);
  }
}
