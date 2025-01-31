import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';

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
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment =
      await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('You are not the author of the comment');
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);
  }
}
