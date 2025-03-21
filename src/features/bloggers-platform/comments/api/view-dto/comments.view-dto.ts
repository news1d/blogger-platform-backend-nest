import { LikeStatus } from '../../../../../core/dto/like-status';
import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesViewModel;

  static mapToView(comment: Comment, userId?: string | null): CommentViewDto {
    const myStatus = userId
      ? comment.likes.find((like) => like.userId)?.status || LikeStatus.None
      : LikeStatus.None;

    const likesCount = comment.likes.filter(
      (like) => like.status === LikeStatus.Like,
    ).length;

    const dislikesCount = comment.likes.filter(
      (like) => like.status === LikeStatus.Dislike,
    ).length;

    const dto = new CommentViewDto();

    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.user.login,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
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
