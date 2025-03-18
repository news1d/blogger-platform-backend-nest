import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { Post } from '../../posts/domain/post.entity';

@Entity()
export class Blog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @Column({
    type: 'enum',
    enum: DeletionStatus,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static createInstance(dto: CreateBlogDomainDto): Blog {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog;
  }

  update(dto: CreateBlogInputDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Blog already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}
