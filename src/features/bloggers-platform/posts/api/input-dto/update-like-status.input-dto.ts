import { LikeStatus } from '../../../../../core/dto/like-status';
import { IsEnum } from 'class-validator';

export class UpdateLikeStatusInputDto {
  @IsEnum(LikeStatus, {
    message:
      'likeStatus must be one of the following values: None, Like, Dislike',
  })
  likeStatus: LikeStatus;
}
