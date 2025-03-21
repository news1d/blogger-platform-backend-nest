import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatus } from '../../../../core/dto/like-status';
import { User } from '../../../user-accounts/domain/user.entity';
import { Post } from './post.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';

@Entity()
export class PostLike extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  postId: number;

  @Column({
    type: 'enum',
    enum: LikeStatus,
    default: LikeStatus.None,
  })
  status: LikeStatus;

  @ManyToOne(() => User, (user) => user.commentsLikes)
  user: User;

  @ManyToOne(() => Post, (post) => post.likes)
  post: Post;

  static createLikeStatus(
    userId: string,
    postId: string,
    likeStatus: LikeStatus,
  ): PostLike {
    const postLike = new this();

    postLike.userId = +userId;
    postLike.postId = +postId;
    postLike.status = likeStatus;

    return postLike;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.status = likeStatus;
  }
}
