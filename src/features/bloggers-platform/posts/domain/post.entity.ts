import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/dto/like-status';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { CreatePostInputDto } from '../api/input-dto/posts.input-dto';

export type PostDocument = HydratedDocument<BlogPost>;
export type PostModelType = Model<PostDocument> & typeof BlogPost;

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: String, enum: Object.values(LikeStatus), required: true })
  status: LikeStatus;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: [PostLikeSchema], default: [] })
  likes: PostLike[];

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  updateLikeStatus(userId: string, userLogin: string, likeStatus: LikeStatus) {
    const existingLike = this.likes.find((like) => like.userId === userId);

    if (existingLike) {
      // Обновляем существующую запись о лайке
      existingLike.status = likeStatus;
      existingLike.createdAt = new Date();
      existingLike.updatedAt = new Date();
    } else {
      // Добавляем новую запись о лайке
      this.likes.push({
        status: likeStatus,
        userId: userId,
        login: userLogin,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    this.recalculateLikesCounters();
  }

  private recalculateLikesCounters() {
    this.likesCount = this.likes.filter(
      (like) => like.status === LikeStatus.Like,
    ).length;
    this.dislikesCount = this.likes.filter(
      (like) => like.status === LikeStatus.Dislike,
    ).length;
  }

  update(dto: CreatePostInputDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Post already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const PostSchema = SchemaFactory.createForClass(BlogPost);
PostSchema.loadClass(BlogPost);
