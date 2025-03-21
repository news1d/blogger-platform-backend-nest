import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { BaseEntity } from '../../../../core/entities/base.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user-accounts/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { CommentLike } from './comment-like.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  postId: number;

  @Column({
    type: 'enum',
    enum: DeletionStatus,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  likes: CommentLike[];

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();
    comment.content = dto.content;
    comment.userId = +dto.userId;
    comment.postId = +dto.postId;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Comment already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}
