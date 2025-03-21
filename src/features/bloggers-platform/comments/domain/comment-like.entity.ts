import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatus } from '../../../../core/dto/like-status';
import { User } from '../../../user-accounts/domain/user.entity';
import { Comment } from './comment.entity';
import { BaseEntity } from '../../../../core/entities/base.entity';

@Entity()
export class CommentLike extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  commentId: number;

  @Column({
    type: 'enum',
    enum: LikeStatus,
    default: LikeStatus.None,
  })
  status: LikeStatus;

  @ManyToOne(() => User, (user) => user.commentsLikes)
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  comment: Comment;

  static createLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: LikeStatus,
  ): CommentLike {
    const commentLike = new this();

    commentLike.userId = +userId;
    commentLike.commentId = +commentId;
    commentLike.status = likeStatus;

    return commentLike;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.status = likeStatus;
  }
}
