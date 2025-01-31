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
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { ApiParam } from '@nestjs/swagger';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params';
import { CreatePostInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsService } from '../../posts/application/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getBlogById(blogId);
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getBlogById(id);
  }

  @ApiParam({ name: 'blogId' })
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getBlogById(blogId);
    return this.postsQueryRepository.getAllPosts(query, blogId);
  }

  @ApiParam({ name: 'blogId' })
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostInputDto,
  ): Promise<PostViewDto> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    const postId = await this.blogsService.createPostByBlogId(
      blogId,
      blog.name,
      body,
    );

    return this.postsQueryRepository.getPostById(postId);
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.blogsService.updateBlogById(id, body);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlogById(id);
  }
}
