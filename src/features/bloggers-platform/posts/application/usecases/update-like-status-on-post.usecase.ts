import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLike } from '../../domain/post-like.entity';

export class UpdateLikeStatusOnPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusOnPostCommand)
export class UpdateLikeStatusOnPostUseCase
  implements ICommandHandler<UpdateLikeStatusOnPostCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ postId, userId, likeStatus }: UpdateLikeStatusOnPostCommand) {
    await this.usersRepository.getUserByIdOrNotFoundFail(userId);
    const post = await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    let postLike = post.likes.find((like) => like.userId === +userId);

    if (postLike) {
      postLike.updateLikeStatus(likeStatus);
    } else {
      postLike = PostLike.createLikeStatus(userId, postId, likeStatus);
    }

    await this.postsRepository.save(postLike);
  }
}
