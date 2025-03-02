import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { UsersRepository } from '../users.repository';
import { UsersSqlRepository } from '../users.sql.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersSqlRepository) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    return MeViewDto.mapToView(user);
  }
}
