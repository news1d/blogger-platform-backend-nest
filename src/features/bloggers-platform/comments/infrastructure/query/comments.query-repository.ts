import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private usersRepository: UsersRepository,
  ) {}

  async getCommentsByPostId(
    query: GetCommentsQueryParams,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const offset = query.calculateSkip();
    const limit = query.pageSize;
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1);
    const sortDirection = query.sortDirection.toUpperCase();

    const comments = await this.dataSource.query(
      `SELECT * FROM "Comments"
     WHERE "PostId" = $1 AND "DeletionStatus" != $2
     ORDER BY "${sortBy}" ${sortDirection}
     LIMIT $3 OFFSET $4`,
      [postId, DeletionStatus.PermanentDeleted, limit, offset],
    );

    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) AS "count"
       FROM "Comments"
       WHERE "PostId" = $1 AND "DeletionStatus" != $2`,
      [postId, DeletionStatus.PermanentDeleted],
    );

    const totalCount = Number(totalCountResult[0].count);
    const items = await Promise.all(
      comments.map((comment) => this.mapToView(comment, userId)),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getCommentByIdOrNotFoundFail(
    commentId: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const comment = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [commentId, DeletionStatus.PermanentDeleted],
    );

    if (!comment.length) {
      throw new NotFoundException('Comment not found');
    }

    return this.mapToView(comment[0], userId);
  }

  async getUserLikeStatusForComment(
    commentId: string,
    userId?: string | null,
  ): Promise<LikeStatus> {
    let myStatus = LikeStatus.None;

    if (userId) {
      const statusResult = await this.dataSource.query(
        `SELECT "Status" FROM "CommentLikes" 
         WHERE "CommentId" = $1 AND "UserId" = $2`,
        [commentId, userId],
      );

      if (statusResult.length > 0) {
        myStatus = statusResult[0].Status;
      }
    }

    return myStatus;
  }

  async getLikesDislikesCountForComment(
    commentId: string,
  ): Promise<{ likesCount: number; dislikesCount: number }> {
    const likesDislikesCounts = await this.dataSource.query(
      `SELECT 
                COUNT(CASE WHEN "Status" = $1 THEN 1 END) AS "likesCount",
                COUNT(CASE WHEN "Status" = $2 THEN 1 END) AS "dislikesCount"
             FROM "CommentLikes"
             WHERE "CommentId" = $3`,
      [LikeStatus.Like, LikeStatus.Dislike, commentId],
    );

    const likesCount = likesDislikesCounts[0]?.likesCount || 0;
    const dislikesCount = likesDislikesCounts[0]?.dislikesCount || 0;

    return { likesCount, dislikesCount };
  }

  async mapToView(comment, userId?: string | null): Promise<CommentViewDto> {
    const { likesCount, dislikesCount } =
      await this.getLikesDislikesCountForComment(comment.Id);
    const myStatus = await this.getUserLikeStatusForComment(comment.Id, userId);
    const user = await this.usersRepository.getUserByIdOrNotFoundFail(
      comment.UserId,
    );

    const dto = new CommentViewDto();

    dto.id = comment.Id.toString();
    dto.content = comment.Content;
    dto.commentatorInfo = {
      userId: comment.UserId.toString(),
      userLogin: user.login,
    };
    dto.createdAt = comment.CreatedAt;
    dto.likesInfo = {
      likesCount: +likesCount,
      dislikesCount: +dislikesCount,
      myStatus: myStatus,
    };

    return dto;
  }
}
