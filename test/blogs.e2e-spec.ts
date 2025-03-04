import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import { initSettings } from './helpers/init-settings';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../src/features/bloggers-platform/blogs/api/view-dto/blogs.view-dto';

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    const result = await initSettings(() => {});

    app = result.app;
    blogsTestManager = result.blogsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create blog', async () => {
    const response = await blogsTestManager.createBlog();

    expect(response).toEqual({
      id: expect.any(String),
      name: blogsTestManager.blogData.name,
      description: blogsTestManager.blogData.description,
      websiteUrl: blogsTestManager.blogData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('should get blogs with paging', async () => {
    const blogs = await blogsTestManager.createSeveralBlogs(9);
    const { body: responseBody } = (await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/blogs?pageSize=5&pageNumber=2&sortDirection=asc&sortBy=name`,
      )
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<BlogViewDto> };

    expect(responseBody.totalCount).toBe(9);
    expect(responseBody.items).toHaveLength(4);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[3]).toEqual(blogs[blogs.length - 1]);
  });

  it('should create post for correct blogId', async () => {
    const blog = await blogsTestManager.createBlog();

    const postResponse = await blogsTestManager.createPost(blog.id);

    expect(postResponse).toEqual({
      id: expect.any(String),
      title: blogsTestManager.postData.title,
      shortDescription: blogsTestManager.postData.shortDescription,
      content: blogsTestManager.postData.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('unauthorized user shouldn`t create blog', async () => {
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/blogs`)
      .send(blogsTestManager.blogData)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should get posts with paging', async () => {
    const blog = await blogsTestManager.createBlog();

    const posts = await blogsTestManager.createSeveralPosts(blog.id, 9);

    const { body: responseBody } = (await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/blogs/${blog.id}/posts?pageSize=5&pageNumber=2&sortDirection=asc&sortBy=title`,
      )
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<BlogViewDto> };

    expect(responseBody.totalCount).toBe(9);
    expect(responseBody.items).toHaveLength(4);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[3]).toEqual(posts[posts.length - 1]);
  });

  it('should return blog by id', async () => {
    const blog = await blogsTestManager.createBlog();

    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${blog.id}`)
      .expect(HttpStatus.OK, blog);
  });

  it('unauthorized user shouldn`t update blog', async () => {
    const newBlogData = {
      name: 'New Blog',
      description: 'A new blog about tech stuff',
      websiteUrl: 'https://newblog.com',
    };

    const blog = await blogsTestManager.createBlog();

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/blogs/${blog.id}`)
      .send(newBlogData)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should update blog with correct data', async () => {
    const newBlogData = {
      name: 'New Blog',
      description: 'A new blog about tech stuff',
      websiteUrl: 'https://newblog.com',
    };

    const blog = await blogsTestManager.createBlog();

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/blogs/${blog.id}`)
      .send(newBlogData)
      .auth(blogsTestManager.authUsername, blogsTestManager.authPassword)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('unauthorized user shouldn`t delete blog', async () => {
    const blog = await blogsTestManager.createBlog();
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/blogs/${blog.id}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should delete blog by id', async () => {
    const blog = await blogsTestManager.createBlog();
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/blogs/${blog.id}`)
      .auth(blogsTestManager.authUsername, blogsTestManager.authPassword)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
