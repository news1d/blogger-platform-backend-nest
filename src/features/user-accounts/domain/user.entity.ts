import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { DeletionStatus } from '../../../core/dto/deletion-status';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Device } from './device.entity';
import { UserMeta } from './user-meta.entity';
import { BaseEntity } from '../../../core/entities/base.entity';
import { Comment } from '../../bloggers-platform/comments/domain/comment.entity';
import { CommentLike } from '../../bloggers-platform/comments/domain/comment-like.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: DeletionStatus,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @OneToOne(() => UserMeta, (userMeta) => userMeta.user, {
    cascade: true,
    eager: true,
  })
  userMeta: UserMeta;

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentsLikes: CommentLike[];

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;

    user.userMeta = UserMeta.createInstance(user);

    return user;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('User already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  updatePasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  setEmailConfirmationCode(code: string) {
    if (!this.userMeta) {
      throw new Error('UserMeta is not initialized');
    }
    this.userMeta.setEmailConfirmationCode(code);
  }

  updateEmailConfirmationStatus() {
    if (!this.userMeta) {
      throw new Error('UserMeta is not initialized');
    }
    this.userMeta.updateEmailConfirmationStatus();
  }

  setPasswordRecoveryCode(code: string) {
    if (!this.userMeta) {
      throw new Error('UserMeta is not initialized');
    }
    this.userMeta.setPasswordRecoveryCode(code);
  }
}
