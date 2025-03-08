import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { UsersSqlRepository } from '../../../../user-accounts/infrastructure/users.sql.repository';
import { PostLikesSqlRepository } from '../../infrastructure/post-likes.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

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
    private usersRepository: UsersSqlRepository,
    private postsRepository: PostsSqlRepository,
    private postLikesRepository: PostLikesSqlRepository,
  ) {}

  async execute({ postId, userId, likeStatus }: UpdateLikeStatusOnPostCommand) {
    await this.usersRepository.getUserByIdOrNotFoundFail(userId);
    await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    await this.postLikesRepository.updateLikeStatus(userId, postId, likeStatus);
  }
}
