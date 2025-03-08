import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsSqlRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment =
      await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    if (comment.UserId.toString() !== userId) {
      throw new ForbiddenException('You are not the author of the comment');
    }

    await this.commentsRepository.makeDeleted(commentId);
  }
}
