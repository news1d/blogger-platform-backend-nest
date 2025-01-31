import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentModelType,
  PostComment,
} from '../../../comments/domain/comment.entity';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

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
    const user = await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    const comment = this.CommentModel.createInstance({
      content: content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      postId: postId,
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
