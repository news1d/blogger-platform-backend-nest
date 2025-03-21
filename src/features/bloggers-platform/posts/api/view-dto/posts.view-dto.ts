import { LikeStatus } from '../../../../../core/dto/like-status';
import { Post } from '../../domain/post.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoDto;

  static mapToView(post: Post, userId?: string | null): PostViewDto {
    const myStatus = userId
      ? post.likes.find((like) => like.userId === +userId)?.status ||
        LikeStatus.None
      : LikeStatus.None;

    const likesCount = post.likes.filter(
      (like) => like.status === LikeStatus.Like,
    ).length;

    const dislikesCount = post.likes.filter(
      (like) => like.status === LikeStatus.Dislike,
    ).length;

    const newestLikes = post.likes
      .filter((like) => like.status === LikeStatus.Like)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3)
      .map((like) => ({
        addedAt: like.updatedAt,
        userId: like.userId.toString(),
        login: like.user.login,
      }));

    const dto = new PostViewDto();

    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blog.name;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes,
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
