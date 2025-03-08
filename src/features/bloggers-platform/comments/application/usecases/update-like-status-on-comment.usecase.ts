import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

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
  constructor(private commentsRepository: CommentsSqlRepository) {}

  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateLikeStatusOnCommentCommand) {
    await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    await this.commentsRepository.updateLikeStatus(
      userId,
      commentId,
      likeStatus,
    );
  }
}
