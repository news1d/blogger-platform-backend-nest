import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesViewModel;

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: LikeStatus.None,
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
