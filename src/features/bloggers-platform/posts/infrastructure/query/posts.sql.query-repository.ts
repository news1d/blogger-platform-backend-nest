import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string | null,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const offset = query.calculateSkip();
    const limit = query.pageSize;
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1);
    const sortDirection = query.sortDirection.toUpperCase();

    let sql = `SELECT * FROM "Posts" WHERE "DeletionStatus" != $1`;
    const params: any[] = [DeletionStatus.PermanentDeleted, offset, limit];

    if (blogId) {
      sql += ` AND "BlogId" = $${params.length + 1}`;
      params.push(blogId);
    }

    sql += ` ORDER BY "${sortBy}" ${sortDirection} OFFSET $2 LIMIT $3`;

    const posts = await this.dataSource.query(sql, params);

    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Posts" WHERE "DeletionStatus" != $1`,
      [DeletionStatus.PermanentDeleted],
    );

    const totalCount = Number(totalCountResult[0].count);
    const items = posts.map((post) => PostViewDto.mapToView(post, userId));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!post.length) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post[0], userId);
  }
}
