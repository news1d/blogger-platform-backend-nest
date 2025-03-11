import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params';
import { NewestLikesDto, PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { LikeStatus } from '../../../../../core/dto/like-status';

@Injectable()
export class PostsQueryRepository {
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

    let whereClause = `"DeletionStatus" != $1`;
    const params: any[] = [DeletionStatus.PermanentDeleted];

    if (blogId) {
      params.push(blogId);
      whereClause += ` AND "BlogId" = $${params.length}`;
    }

    const posts = await this.dataSource.query(
      `SELECT * FROM "Posts"
     WHERE ${whereClause}
     ORDER BY "${sortBy}" ${sortDirection}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Posts" WHERE ${whereClause}`,
      params,
    );

    const totalCount = Number(totalCountResult[0].count);
    const items = await Promise.all(
      posts.map((post) => this.mapToView(post, userId)),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getUserLikeStatusForPost(
    postId: string,
    userId?: string | null,
  ): Promise<LikeStatus> {
    let myStatus = LikeStatus.None;

    if (userId) {
      const statusResult = await this.dataSource.query(
        `SELECT "Status" FROM "PostLikes" 
         WHERE "PostId" = $1 AND "UserId" = $2`,
        [postId, userId],
      );

      if (statusResult.length > 0) {
        myStatus = statusResult[0].Status;
      }
    }

    return myStatus;
  }

  async getNewestLikesForPost(
    postId: string,
    count: number,
  ): Promise<NewestLikesDto[]> {
    const newestLikes = await this.dataSource.query(
      `SELECT pl."UserId", u."Login", pl."CreatedAt"
       FROM "PostLikes" pl
                LEFT JOIN "Users" u ON pl."UserId" = u."Id"
       WHERE pl."PostId" = $1 AND pl."Status" = $2
       ORDER BY pl."CreatedAt" DESC
           LIMIT $3;`,
      [postId, LikeStatus.Like, count],
    );

    return newestLikes.map((like) => ({
      userId: like.UserId.toString(),
      login: like.Login,
      addedAt: like.CreatedAt,
    }));
  }

  async getLikesDislikesCountForPost(
    postId: string,
  ): Promise<{ likesCount: number; dislikesCount: number }> {
    const likesDislikesCounts = await this.dataSource.query(
      `SELECT 
                COUNT(CASE WHEN "Status" = $1 THEN 1 END) AS "likesCount",
                COUNT(CASE WHEN "Status" = $2 THEN 1 END) AS "dislikesCount"
             FROM "PostLikes"
             WHERE "PostId" = $3`,
      [LikeStatus.Like, LikeStatus.Dislike, postId],
    );

    const likesCount = likesDislikesCounts[0]?.likesCount || 0;
    const dislikesCount = likesDislikesCounts[0]?.dislikesCount || 0;

    return { likesCount, dislikesCount };
  }

  async getBlogNameForPost(postId: string): Promise<string> {
    const result = await this.dataSource.query(
      `SELECT b."Name"
     FROM "Posts" p
     JOIN "Blogs" b ON p."BlogId" = b."Id"
     WHERE p."Id" = $1`,
      [postId],
    );

    return result[0].Name;
  }

  async getPostByIdOrNotFoundFail(
    postId: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [postId, DeletionStatus.PermanentDeleted],
    );

    if (!post.length) {
      throw new NotFoundException('Post not found');
    }

    return this.mapToView(post[0], userId);
  }

  async mapToView(post, userId?: string | null): Promise<PostViewDto> {
    const { likesCount, dislikesCount } =
      await this.getLikesDislikesCountForPost(post.Id);
    const myStatus = await this.getUserLikeStatusForPost(post.Id, userId);
    const newestLikes = await this.getNewestLikesForPost(post.Id, 3);
    const blogName = await this.getBlogNameForPost(post.Id);

    const dto = new PostViewDto();

    dto.id = post.Id.toString();
    dto.title = post.Title;
    dto.shortDescription = post.ShortDescription;
    dto.content = post.Content;
    dto.blogId = post.BlogId.toString();
    dto.blogName = blogName;
    dto.createdAt = post.CreatedAt;
    dto.extendedLikesInfo = {
      likesCount: +likesCount,
      dislikesCount: +dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes,
    };

    return dto;
  }
}
