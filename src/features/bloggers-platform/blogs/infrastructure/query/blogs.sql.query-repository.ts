import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllBlogs(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const offset = query.calculateSkip();
    const limit = query.pageSize;
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1);
    const sortDirection = query.sortDirection.toUpperCase();

    let whereClause = `"DeletionStatus" != $1`;
    const params: any[] = [DeletionStatus.PermanentDeleted];

    if (query.searchNameTerm) {
      params.push(`%${query.searchNameTerm}%`);
      whereClause += ` AND "Name" ILIKE $${params.length}`;
    }

    const blogs = await this.dataSource.query(
      `SELECT * FROM "Blogs"
       WHERE ${whereClause}
       ORDER BY "${sortBy}" ${sortDirection}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Blogs" WHERE ${whereClause}`,
      params,
    );

    const totalCount = Number(totalCountResult[0].count);
    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getBlogByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!blog.length) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToView(blog[0]);
  }
}
