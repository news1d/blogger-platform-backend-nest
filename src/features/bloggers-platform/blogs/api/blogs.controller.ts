import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { ApiBasicAuth, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreatePostForBlogCommand } from '../application/usecases/create-post-for-blog.usecase';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CreatePostWithoutBlogIdInputDto } from '../../posts/api/input-dto/posts-without-blogId.input-dto';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs.sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts.sql.query-repository';
import { DeletePostFromBlogCommand } from '../application/usecases/delete-post-from-blog.usecase';
import { UpdatePostFromBlogCommand } from '../application/usecases/update-post-from-blog.usecase';
@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsSqlQueryRepository,
    private postsQueryRepository: PostsSqlQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'blogId' })
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getBlogByIdOrNotFoundFail(blogId);
    return this.postsQueryRepository.getAllPosts(
      query,
      user?.id || null,
      blogId,
    );
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getBlogByIdOrNotFoundFail(id);
  }
}

@ApiBasicAuth('basicAuth')
@UseGuards(BasicAuthGuard)
@SkipThrottle()
@Controller('sa/blogs')
export class BlogsSaController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsSqlQueryRepository,
    private postsQueryRepository: PostsSqlQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @ApiBasicAuth('basicAuth')
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getBlogByIdOrNotFoundFail(blogId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @ApiParam({ name: 'blogId' })
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getBlogByIdOrNotFoundFail(blogId);
    return this.postsQueryRepository.getAllPosts(
      query,
      user?.id || null,
      blogId,
    );
  }

  @ApiParam({ name: 'blogId' })
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostWithoutBlogIdInputDto,
  ): Promise<PostViewDto> {
    const blog =
      await this.blogsQueryRepository.getBlogByIdOrNotFoundFail(blogId);

    const postId = await this.commandBus.execute(
      new CreatePostForBlogCommand(blogId, blog.name, body),
    );

    return this.postsQueryRepository.getPostByIdOrNotFoundFail(postId);
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @ApiParam({ name: 'blogId' })
  @ApiParam({ name: 'postId' })
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostFromBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: CreatePostWithoutBlogIdInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostFromBlogCommand(blogId, postId, body),
    );
  }

  @ApiParam({ name: 'blogId' })
  @ApiParam({ name: 'postId' })
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostFromBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeletePostFromBlogCommand(blogId, postId),
    );
  }
}
