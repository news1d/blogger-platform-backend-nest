import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentModelType,
  PostComment,
} from '../../../comments/domain/comment.entity';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { CommentsSqlRepository } from '../../../comments/infrastructure/comments.sql.repository';

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
    @InjectModel(PostComment.name) private CommentModel: CommentModelType,
    private postsRepository: PostsSqlRepository,
    private usersRepository: UsersSqlRepository,
    private commentsRepository: CommentsSqlRepository,
  ) {}

  async execute({
    postId,
    userId,
    content,
  }: CreateCommentForPostCommand): Promise<string> {
    await this.postsRepository.getPostByIdOrNotFoundFail(postId);
    await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    const comment = await this.commentsRepository.createComment({
      content: content,
      userId: userId,
      postId: postId,
    });

    return comment.Id.toString();
  }
}
