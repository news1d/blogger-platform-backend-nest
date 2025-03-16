import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { DeletionStatus } from '../../../core/dto/deletion-status';
import { UserMeta } from '../domain/user-meta.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserMeta)
    private userMetaRepository: Repository<UserMeta>,
  ) {}

  async getUserByIdOrNotFoundFail(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      id: +id,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      login: login,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      email: email,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async getUserByRecoveryCode(code: string): Promise<User | null> {
    const userMeta = await this.userMetaRepository.findOneBy({
      passwordRecoveryCode: code,
    });

    return this.usersRepository.findOneBy({
      id: userMeta?.userId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async getUserByConfirmationCode(code: string): Promise<User | null> {
    const userMeta = await this.userMetaRepository.findOneBy({
      emailConfirmationCode: code,
    });

    return this.usersRepository.findOneBy({
      id: userMeta?.userId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [
        { login: loginOrEmail, deletionStatus: DeletionStatus.NotDeleted },
        { email: loginOrEmail, deletionStatus: DeletionStatus.NotDeleted },
      ],
    });
  }

  async save(user: User) {
    return this.usersRepository.save(user);
  }
}
