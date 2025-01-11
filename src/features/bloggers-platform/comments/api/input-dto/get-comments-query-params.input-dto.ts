import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { CommentsSortBy } from './comments-sort-by';

export class GetCommentsQueryParams extends BaseSortablePaginationParams<CommentsSortBy> {
  sortBy = CommentsSortBy.CreatedAt;
}
