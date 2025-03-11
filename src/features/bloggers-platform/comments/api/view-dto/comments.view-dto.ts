import { LikeStatus } from '../../../../../core/dto/like-status';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesViewModel;
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
