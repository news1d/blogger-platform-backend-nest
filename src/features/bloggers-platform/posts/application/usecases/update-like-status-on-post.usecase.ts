import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatus } from '../../../../../core/dto/like-status';

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
    const user = await this.usersRepository.getUserByIdOrNotFoundFail(userId);

    const post = await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    post.updateLikeStatus(user.id, user.login, likeStatus);

    await this.postsRepository.save(post);
  }
}
