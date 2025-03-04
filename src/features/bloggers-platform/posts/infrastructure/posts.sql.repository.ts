import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreatePostDomainDto } from '../domain/dto/create-post.domain.dto';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPostByIdOrNotFoundFail(id: string) {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!post.length) {
      throw new NotFoundException('Post not found');
    }

    return post[0];
  }

  async createPost(dto: CreatePostDomainDto) {
    const result = await this.dataSource.query(
      `INSERT INTO "Posts" ("Title", "ShortDescription", "Content", "BlogId", "BlogName")
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId, dto.blogName],
    );
    return result[0];
  }
}
