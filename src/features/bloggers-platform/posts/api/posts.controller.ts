import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { ApiBasicAuth, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comments.input-dto';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CreateCommentForPostCommand } from '../application/usecases/create-comment-for-post.usecase';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UpdateLikeStatusInputDto } from './input-dto/update-like-status.input-dto';
import { UpdateLikeStatusOnPostCommand } from '../application/usecases/update-like-status-on-post.usecase';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' })
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId') postId: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateLikeStatusOnPostCommand(postId, user.id, body.likeStatus),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'postId' })
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.getPostByIdOrNotFoundFail(postId);

    return this.commentsQueryRepository.getCommentsByPostId(
      query,
      postId,
      user?.id || null,
    );
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'postId' })
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentForPostCommand(postId, user.id, body.content),
    );

    return this.commentsQueryRepository.getCommentByIdOrNotFoundFail(commentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAllPosts(query, user?.id || null);
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand(body));

    return this.postsQueryRepository.getPostByIdOrNotFoundFail(postId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'id' })
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.getPostByIdOrNotFoundFail(
      id,
      user?.id || null,
    );
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdatePostCommand(id, body));
  }

  @ApiBasicAuth('basicAuth')
  @UseGuards(BasicAuthGuard)
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }
}
