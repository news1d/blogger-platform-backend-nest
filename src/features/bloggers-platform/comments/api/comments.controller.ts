import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UpdateLikeStatusInputDto } from '../../posts/api/input-dto/update-like-status.input-dto';
import { UpdateLikeStatusOnCommentCommand } from '../application/usecases/update-like-status-on-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' })
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateLikeStatusOnCommentCommand(commentId, user.id, body.likeStatus),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' })
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentById(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentCommand(commentId, user.id, body.content),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' })
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteCommentCommand(commentId, user.id),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id' })
  @Get(':id')
  async getCommentById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getCommentByIdOrNotFoundFail(
      id,
      user?.id || null,
    );
  }
}
