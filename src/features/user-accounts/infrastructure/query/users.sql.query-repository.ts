import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UsersSortBy } from '../../api/input-dto/users-sort-by';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const offset = query.calculateSkip();
    const limit = query.pageSize;
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1);
    const sortDirection = query.sortDirection.toUpperCase();

    let whereClause = `"DeletionStatus" != 'PermanentDeleted'`;
    const params: any[] = [];

    if (query.searchLoginTerm) {
      params.push(`%${query.searchLoginTerm}%`);
      whereClause += ` AND "Login" ILIKE $${params.length}`;
    }

    if (query.searchEmailTerm) {
      params.push(`%${query.searchEmailTerm}%`);
      if (params.length > 1) {
        whereClause += ` OR "Email" ILIKE $${params.length}`; // Если есть оба фильтра, добавляем OR
      } else {
        whereClause += ` AND "Email" ILIKE $${params.length}`; // Если фильтруем только по email, используем AND
      }
    }

    const users = await this.dataSource.query(
      `SELECT * FROM "Users"
       WHERE ${whereClause}
       ORDER BY "${sortBy}" ${sortDirection}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const totalCountResult = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Users" WHERE ${whereClause}`,
      params,
    );

    const totalCount = Number(totalCountResult[0].count);
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getUserByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "Id" = $1 AND "DeletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );

    if (!user.length) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user[0]);
  }
}
