import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { Post } from '../../domain/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string | null,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'user')
      .where('post.deletionStatus = :deletionStatus', {
        deletionStatus: DeletionStatus.NotDeleted,
      });

    if (blogId) {
      queryBuilder.andWhere('post.blogId = :blogId', { blogId });
    }

    const sortField =
      query.sortBy === 'blogName' ? 'blog.name' : `post.${query.sortBy}`;

    const [posts, totalCount] = await queryBuilder
      .orderBy(sortField, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(query.calculateSkip())
      .take(query.pageSize)
      .getManyAndCount();

    const items = posts.map((post) => PostViewDto.mapToView(post, userId));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostByIdOrNotFoundFail(
    postId: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const post = await this.postsRepository.findOne({
      where: { id: +postId, deletionStatus: DeletionStatus.NotDeleted },
      relations: {
        blog: true,
        likes: {
          user: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post, userId);
  }
}
