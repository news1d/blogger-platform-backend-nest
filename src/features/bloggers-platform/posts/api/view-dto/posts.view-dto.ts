import { LikeStatus } from '../../../../../core/dto/like-status';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoDto;
}

export class ExtendedLikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikesDto[] | null;
}

export class NewestLikesDto {
  addedAt: Date;
  userId: string;
  login: string;
}
