import { BaseEntity } from '../../../../core/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { CreatePostInputDto } from '../api/input-dto/posts.input-dto';
import { Blog } from '../../blogs/domain/blog.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  shortDescription: string;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'integer', nullable: false })
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column({
    type: 'enum',
    enum: DeletionStatus,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreatePostDomainDto): Post {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = +dto.blogId;

    return post;
  }

  update(dto: CreatePostInputDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = +dto.blogId;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Post already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}
