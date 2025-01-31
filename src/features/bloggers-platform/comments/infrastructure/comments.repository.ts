import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CommentDocument,
  CommentModelType,
  PostComment,
} from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(PostComment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentByIdOrNotFoundFail(
    commentId: string,
  ): Promise<CommentDocument> {
    const comment = await this.CommentModel.findOne({
      _id: commentId,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }
}
