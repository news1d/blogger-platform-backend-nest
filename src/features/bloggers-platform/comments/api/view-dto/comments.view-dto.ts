import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesViewModel;

  static mapToView(
    comment: CommentDocument,
    userId?: string | null,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    const myStatus = userId
      ? comment.likes.find((like) => like.authorId === userId)?.status ||
        LikeStatus.None
      : LikeStatus.None;

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: myStatus,
    };

    return dto;
  }
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class LikesViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}
