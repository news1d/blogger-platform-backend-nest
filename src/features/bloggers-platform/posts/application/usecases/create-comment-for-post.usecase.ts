import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { Comment } from '../../../comments/domain/comment.entity';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
  implements ICommandHandler<CreateCommentForPostCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({
    postId,
    userId,
    content,
  }: CreateCommentForPostCommand): Promise<string> {
    await this.postsRepository.getPostByIdOrNotFoundFail(postId);
    await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    const comment = Comment.createInstance({
      content: content,
      userId: userId,
      postId: postId,
    });

    await this.commentsRepository.save(comment);

    return comment.id.toString();
  }
}
