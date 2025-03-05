import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogByIdOrNotFoundFail(id: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!result.length) {
      throw new NotFoundException('Blog not found');
    }

    return result[0];
  }

  async getBlogById(id: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    return result.length ? result[0] : null;
  }

  async createBlog(dto: CreateBlogDto) {
    const result = await this.dataSource.query(
      `INSERT INTO "Blogs" ("Name", "Description", "WebsiteUrl")
       VALUES ($1, $2, $3) RETURNING *`,
      [dto.name, dto.description, dto.websiteUrl],
    );
    return result[0];
  }

  async update(id: string, dto: CreateBlogDto) {
    const result = await this.dataSource.query(
      `UPDATE "Blogs" 
       SET "Name" = $1, "Description" = $2, "WebsiteUrl" = $3
       WHERE "Id" = $4 AND "DeletionStatus" != $5 RETURNING *`,
      [
        dto.name,
        dto.description,
        dto.websiteUrl,
        id,
        DeletionStatus.PermanentDeleted,
      ],
    );

    if (!result.length) {
      throw new NotFoundException('Blog not found');
    }

    return result[0];
  }

  async makeDeleted(id: string) {
    const result = await this.dataSource.query(
      `UPDATE "Blogs"
       SET "DeletionStatus" = $1 
       WHERE "Id" = $2 AND "DeletionStatus" = $3 RETURNING *`,
      [DeletionStatus.PermanentDeleted, id, DeletionStatus.NotDeleted],
    );

    if (!result.length) {
      throw new Error('Blog already deleted or not found');
    }

    return result[0];
  }
}
