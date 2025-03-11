import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getCommentByIdOrNotFoundFail(commentId: string) {
    const comment = await this.dataSource.query(
      `SELECT *
       FROM "Comments"
       WHERE "Id" = $1
         AND "DeletionStatus" != $2`,
      [commentId, DeletionStatus.PermanentDeleted],
    );

    if (!comment.length) {
      throw new NotFoundException('Comment not found');
    }

    return comment[0];
  }

  async createComment(dto: CreateCommentDto) {
    const result = await this.dataSource.query(
      `INSERT INTO "Comments" ("Content", "UserId", "PostId")
       VALUES ($1, $2, $3 ) RETURNING *`,
      [dto.content, dto.userId, dto.postId],
    );
    return result[0];
  }

  async update(id: string, content: string) {
    const result = await this.dataSource.query(
      `UPDATE "Comments"
       SET "Content" = $1
       WHERE "Id" = $2 AND "DeletionStatus" != $3
       RETURNING *`,
      [content, id, DeletionStatus.PermanentDeleted],
    );

    if (!result.length) {
      throw new NotFoundException('Comment not found');
    }

    return result[0];
  }

  async updateLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const existingLike = await this.dataSource.query(
      `SELECT * FROM "CommentLikes" 
       WHERE "UserId" = $1 AND "CommentId" = $2`,
      [userId, commentId],
    );

    if (existingLike.length) {
      // Обновляем существующую запись о лайке
      await this.dataSource.query(
        `UPDATE "CommentLikes"
         SET "Status" = $1, "CreatedAt" = now()
         WHERE "UserId" = $2 AND "CommentId" = $3`,
        [likeStatus, userId, commentId],
      );
    } else {
      // Добавляем новую запись о лайке
      await this.dataSource.query(
        `INSERT INTO "CommentLikes" ("UserId", "CommentId", "Status")
         VALUES ($1, $2, $3)`,
        [userId, commentId, likeStatus],
      );
    }
  }

  async makeDeleted(id: string) {
    const result = await this.dataSource.query(
      `UPDATE "Comments"
       SET "DeletionStatus" = $1
       WHERE "Id" = $2 AND "DeletionStatus" = $3
       RETURNING *`,
      [DeletionStatus.PermanentDeleted, id, DeletionStatus.NotDeleted],
    );

    if (!result.length) {
      throw new Error('Post already deleted or not found');
    }

    return result[0];
  }
}
