import { LikeStatus } from '../../../../../core/dto/like-status';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoDto;

  static mapToView(post, userId?: string | null): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.Id.toString();
    dto.title = post.Title;
    dto.shortDescription = post.ShortDescription;
    dto.content = post.Content;
    dto.blogId = post.BlogId.toString();
    dto.blogName = post.BlogName;
    dto.createdAt = post.CreatedAt;

    // const myStatus = userId
    //   ? post.likes.find((like) => like.userId === userId)?.status ||
    //     LikeStatus.None
    //   : LikeStatus.None;
    //
    // const newestLikes = post.likes
    //   .filter((like) => like.status === LikeStatus.Like)
    //   .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    //   .slice(0, 3)
    //   .map((like) => ({
    //     addedAt: like.createdAt,
    //     userId: like.userId,
    //     login: like.login,
    //   }));
    //
    // dto.extendedLikesInfo = {
    //   likesCount: post.likesCount,
    //   dislikesCount: post.dislikesCount,
    //   myStatus: myStatus,
    //   newestLikes: newestLikes,
    // };

    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };

    return dto;
  }
}

export class ExtendedLikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikesDto[] | null;
}

export class NewestLikesDto {
  addedAt: Date;
  userId: string;
  login: string;
}
