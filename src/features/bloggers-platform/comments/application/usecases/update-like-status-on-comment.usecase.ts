import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLike } from '../../domain/comment-like.entity';

export class UpdateLikeStatusOnCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusOnCommentCommand)
export class UpdateLikeStatusOnCommentUseCase
  implements ICommandHandler<UpdateLikeStatusOnCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateLikeStatusOnCommentCommand) {
    const comment =
      await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    let commentLike = comment.likes.find((like) => like.userId === +userId);

    if (commentLike) {
      commentLike.updateLikeStatus(likeStatus);
    } else {
      commentLike = CommentLike.createLikeStatus(userId, commentId, likeStatus);
    }

    await this.commentsRepository.save(commentLike);
  }
}
