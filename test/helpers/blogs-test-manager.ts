import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../src/features/bloggers-platform/blogs/api/input-dto/blogs.input-dto';
import { BlogViewDto } from '../../src/features/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { CreatePostInputDto } from '../../src/features/bloggers-platform/posts/api/input-dto/posts.input-dto';
import { PostViewDto } from '../../src/features/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { AuthConfig } from '../../src/features/user-accounts/config/auth.config';
import { CreateBlogDto } from '../../src/features/bloggers-platform/blogs/dto/create-blog.dto';
import { CreatePostDto } from '../../src/features/bloggers-platform/posts/dto/create-post.dto';

export class BlogsTestManager {
  constructor(
    private app: INestApplication,
    private authConfig: AuthConfig,
  ) {}

  authUsername = this.authConfig.authUsername;
  authPassword = this.authConfig.authPassword;

  blogData: CreateBlogDto = {
    name: 'Tech Blog',
    description: 'A blog about tech stuff',
    websiteUrl: 'https://techblog.com',
  };

  postData: Omit<CreatePostDto, 'blogId'> = {
    title: 'First Post',
    shortDescription: 'Short description about post',
    content: 'Some content',
  };

  async createBlog(
    createModel: CreateBlogInputDto = this.blogData,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/blogs`)
      .send(createModel)
      .auth(this.authUsername, this.authPassword)
      .expect(statusCode);

    return response.body;
  }

  // async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
  //   const blogsPromises = [] as Promise<BlogViewDto>[];
  //
  //   for (let i = 0; i < count; i++) {
  //     await delay(50);
  //     const response = this.createBlog({
  //       name: 'blogName' + i,
  //       description: 'blogDescription' + i,
  //       websiteUrl: `https://www.some${i}site.com`,
  //     });
  //     blogsPromises.push(response);
  //   }
  //
  //   return Promise.all(blogsPromises);
  // }

  async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
    const blogs: BlogViewDto[] = [];
    for (let i = 0; i < count; i++) {
      const blog = await this.createBlog({
        name: 'BlogName' + i,
        description: 'BlogDescription' + i,
        websiteUrl: `https://blog${i}.com`,
      });
      blogs.push(blog);
    }
    return blogs;
  }

  async createPost(
    blogId: string,
    createPostModel: Omit<CreatePostInputDto, 'blogId'> = this.postData,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/blogs/${blogId}/posts`)
      .auth(this.authUsername, this.authPassword)
      .send(createPostModel)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralPosts(
    blogId: string,
    count: number,
  ): Promise<PostViewDto[]> {
    const posts: PostViewDto[] = [];
    for (let i = 0; i < count; i++) {
      const post = await this.createPost(blogId, {
        title: 'PostTitle' + i,
        shortDescription: 'ShortDescription' + i,
        content: 'SomeContent' + i,
      });
      posts.push(post);
    }
    return posts;
  }
}
