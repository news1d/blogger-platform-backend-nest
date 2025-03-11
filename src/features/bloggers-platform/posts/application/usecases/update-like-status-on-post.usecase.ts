import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

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
    private postLikesRepository: PostLikesRepository,
  ) {}

  async execute({ postId, userId, likeStatus }: UpdateLikeStatusOnPostCommand) {
    await this.usersRepository.getUserByIdOrNotFoundFail(userId);
    await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    await this.postLikesRepository.updateLikeStatus(userId, postId, likeStatus);
  }
}
