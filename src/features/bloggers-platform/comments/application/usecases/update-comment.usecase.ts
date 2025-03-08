import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsSqlRepository) {}

  async execute({
    commentId,
    userId,
    content,
  }: UpdateCommentCommand): Promise<void> {
    const comment =
      await this.commentsRepository.getCommentByIdOrNotFoundFail(commentId);

    if (comment.UserId.toString() !== userId) {
      throw new ForbiddenException('You are not the author of the comment');
    }

    await this.commentsRepository.update(commentId, content);
  }
}
