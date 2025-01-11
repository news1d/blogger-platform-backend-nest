import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/dto/like-status';
import { HydratedDocument, Model } from 'mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

export type CommentDocument = HydratedDocument<PostComment>;
export type CommentModelType = Model<CommentDocument> & typeof PostComment;

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, enum: Object.values(LikeStatus), required: true })
  status: LikeStatus;

  @Prop({ type: String, required: true })
  authorId: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

@Schema({ timestamps: true })
export class PostComment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    required: true,
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: [CommentLikeSchema], default: [] })
  likes: CommentLike[];

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Comment already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const CommentSchema = SchemaFactory.createForClass(PostComment);
CommentSchema.loadClass(PostComment);
