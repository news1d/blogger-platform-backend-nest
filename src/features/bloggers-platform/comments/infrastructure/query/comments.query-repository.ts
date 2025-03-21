import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async getCommentsByPostId(
    query: GetCommentsQueryParams,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const [comments, totalCount] = await this.commentsRepository.findAndCount({
      where: {
        postId: +postId,
        deletionStatus: DeletionStatus.NotDeleted,
      },
      relations: { user: true, likes: true },
      order: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = comments.map((comment) =>
      CommentViewDto.mapToView(comment, userId),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getCommentByIdOrNotFoundFail(
    commentId: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id: +commentId, deletionStatus: DeletionStatus.NotDeleted },
      relations: { user: true, likes: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToView(comment, userId);
  }
}
