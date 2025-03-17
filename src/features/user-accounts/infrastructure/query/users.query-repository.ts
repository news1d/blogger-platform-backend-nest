import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const searchConditions: any[] = [];

    if (query.searchLoginTerm) {
      searchConditions.push({ login: ILike(`%${query.searchLoginTerm}%`) });
    }

    if (query.searchEmailTerm) {
      searchConditions.push({ email: ILike(`%${query.searchEmailTerm}%`) });
    }

    const totalFilter = searchConditions.length
      ? searchConditions.map((condition) => ({
          ...condition,
          deletionStatus: DeletionStatus.NotDeleted,
        }))
      : { deletionStatus: DeletionStatus.NotDeleted };

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where: totalFilter,
      order: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getUserByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.usersRepository.findOneBy({
      id: +id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }
}
