import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getCommentByIdOrNotFoundFail(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: +id,
        deletionStatus: DeletionStatus.NotDeleted,
      },
      relations: { likes: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async save(comment: Comment | CommentLike) {
    return this.dataSource.createEntityManager().save(comment);
  }
}
