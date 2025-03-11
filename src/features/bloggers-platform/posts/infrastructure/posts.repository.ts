import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPostByIdOrNotFoundFail(id: string) {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" 
       WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!post.length) {
      throw new NotFoundException('Post not found');
    }

    return post[0];
  }

  async createPost(dto: CreatePostDto) {
    const result = await this.dataSource.query(
      `INSERT INTO "Posts" ("Title", "ShortDescription", "Content", "BlogId", "BlogName")
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId, dto.blogName],
    );
    return result[0];
  }

  async getPostByIdAndBlogIdOrNotFoundFail(blogId: string, postId: string) {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" 
       WHERE "Id" = $1 AND "BlogId" = $2 AND "DeletionStatus" != $3`,
      [postId, blogId, DeletionStatus.PermanentDeleted],
    );

    if (!post.length) {
      throw new NotFoundException(
        'Post not found or does not belong to the specified blog',
      );
    }

    return post[0];
  }

  async update(id: string, dto: Omit<UpdatePostDto, 'blogId'>) {
    const result = await this.dataSource.query(
      `UPDATE "Posts"
       SET "Title" = $1, "ShortDescription" = $2, "Content" = $3
       WHERE "Id" = $4 AND "DeletionStatus" != $5 RETURNING *`,
      [
        dto.title,
        dto.shortDescription,
        dto.content,
        id,
        DeletionStatus.PermanentDeleted,
      ],
    );

    if (!result.length) {
      throw new NotFoundException('Post not found');
    }

    return result[0];
  }

  async makeDeleted(id: string) {
    const result = await this.dataSource.query(
      `UPDATE "Posts"
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
