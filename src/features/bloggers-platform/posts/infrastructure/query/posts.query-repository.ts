import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params';
import { NewestLikesDto, PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { LikeStatus } from '../../../../../core/dto/like-status';
import { Post } from '../../domain/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string | null,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: any = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (blogId) {
      filter.blogId = blogId;
    }

    const [posts, totalCount] = await this.postsRepository.findAndCount({
      where: filter,
      order: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = await Promise.all(
      posts.map((post) => this.mapToView(post, userId)),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getUserLikeStatusForPost(
    postId: string,
    userId?: string | null,
  ): Promise<LikeStatus> {
    let myStatus = LikeStatus.None;

    if (userId) {
      const statusResult = await this.dataSource.query(
        `SELECT "Status" FROM "PostLikes" 
         WHERE "PostId" = $1 AND "UserId" = $2`,
        [postId, userId],
      );

      if (statusResult.length > 0) {
        myStatus = statusResult[0].Status;
      }
    }

    return myStatus;
  }

  async getNewestLikesForPost(
    postId: string,
    count: number,
  ): Promise<NewestLikesDto[]> {
    const newestLikes = await this.dataSource.query(
      `SELECT pl."UserId", u."Login", pl."CreatedAt"
       FROM "PostLikes" pl
                LEFT JOIN "Users" u ON pl."UserId" = u."Id"
       WHERE pl."PostId" = $1 AND pl."Status" = $2
       ORDER BY pl."CreatedAt" DESC
           LIMIT $3;`,
      [postId, LikeStatus.Like, count],
    );

    return newestLikes.map((like) => ({
      userId: like.UserId.toString(),
      login: like.Login,
      addedAt: like.CreatedAt,
    }));
  }

  async getLikesDislikesCountForPost(
    postId: string,
  ): Promise<{ likesCount: number; dislikesCount: number }> {
    const likesDislikesCounts = await this.dataSource.query(
      `SELECT 
                COUNT(CASE WHEN "Status" = $1 THEN 1 END) AS "likesCount",
                COUNT(CASE WHEN "Status" = $2 THEN 1 END) AS "dislikesCount"
             FROM "PostLikes"
             WHERE "PostId" = $3`,
      [LikeStatus.Like, LikeStatus.Dislike, postId],
    );

    const likesCount = likesDislikesCounts[0]?.likesCount || 0;
    const dislikesCount = likesDislikesCounts[0]?.dislikesCount || 0;

    return { likesCount, dislikesCount };
  }

  async getBlogNameForPost(postId: string): Promise<string> {
    const post = await this.postsRepository.findOne({
      where: { id: +postId },
      relations: ['blog'],
    });

    return post!.blog.name;
  }

  async getPostByIdOrNotFoundFail(
    postId: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const post = await this.postsRepository.findOneBy({
      id: +postId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.mapToView(post, userId);
  }

  async mapToView(post: Post, userId?: string | null): Promise<PostViewDto> {
    // const { likesCount, dislikesCount } =
    //   await this.getLikesDislikesCountForPost(post.id.toString());
    // const myStatus = await this.getUserLikeStatusForPost(
    //   post.id.toString(),
    //   userId,
    // );
    // const newestLikes = await this.getNewestLikesForPost(post.id.toString(), 3);
    const blogName = await this.getBlogNameForPost(post.id.toString());

    const dto = new PostViewDto();

    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
    // dto.extendedLikesInfo = {
    //   likesCount: +likesCount,
    //   dislikesCount: +dislikesCount,
    //   myStatus: myStatus,
    //   newestLikes: newestLikes,
    // };

    return dto;
  }
}
