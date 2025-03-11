import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateLikeStatus(userId: string, postId: string, likeStatus: string) {
    const existingLike = await this.dataSource.query(
      `SELECT * FROM "PostLikes" 
       WHERE "UserId" = $1 AND "PostId" = $2`,
      [userId, postId],
    );

    if (existingLike.length) {
      // Обновляем существующую запись о лайке
      await this.dataSource.query(
        `UPDATE "PostLikes"
       SET "Status" = $1, "CreatedAt" = now()
       WHERE "UserId" = $2 AND "PostId" = $3`,
        [likeStatus, userId, postId],
      );
    } else {
      // Добавляем новую запись о лайке
      await this.dataSource.query(
        `INSERT INTO "PostLikes" ("UserId", "PostId", "Status")
         VALUES ($1, $2, $3)`,
        [userId, postId, likeStatus],
      );
    }
  }

  async getStatusForPostByUserId(
    postId: string,
    userId?: string | null,
  ): Promise<string> {
    if (!userId) {
      return 'None';
    }

    const likeStatus = await this.dataSource.query(
      `SELECT 'Status' FROM "PostLikes"
       WHERE "UserId" = $1 AND "PostId" = $2`,
      [userId, postId],
    );

    if (!likeStatus.length) {
      return 'None';
    }

    return likeStatus[0];
  }
}
