import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentsRepository } from '../../infrastructure/comments.repository';

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

    comment.updateLikeStatus(userId, likeStatus);

    await this.commentsRepository.save(comment);
  }
}
