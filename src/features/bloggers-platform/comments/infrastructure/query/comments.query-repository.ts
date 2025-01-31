import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentModelType, PostComment } from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { User } from '../../../../user-accounts/domain/user.entity';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(PostComment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToView(comment, userId);
  }

  async getCommentsByPostId(
    query: GetCommentsQueryParams,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<User> = {
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
      postId: postId,
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

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
}
