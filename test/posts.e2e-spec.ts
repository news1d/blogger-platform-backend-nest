import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../src/features/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { UsersTestManager } from './helpers/users-test-manager';
import { LikeStatus } from '../src/core/dto/like-status';

describe('posts', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings(() => {});

    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    usersTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create post', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    expect(post).toEqual({
      id: expect.any(String),
      title: postsTestManager.postData.title,
      shortDescription: postsTestManager.postData.shortDescription,
      content: postsTestManager.postData.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('should get posts with paging', async () => {
    const blog = await blogsTestManager.createBlog();
    const posts = await postsTestManager.createSeveralPosts(blog.id, 9);

    const { body: responseBody } = (await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/posts?pageSize=5&pageNumber=2&sortDirection=asc&sortBy=content`,
      )
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<BlogViewDto> };

    expect(responseBody.totalCount).toBe(9);
    expect(responseBody.items).toHaveLength(4);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[3]).toEqual(posts[posts.length - 1]);
  });

  it('unauthorized user shouldn`t create post', async () => {
    const blog = await blogsTestManager.createBlog();

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send({ blogId: blog.id, ...postsTestManager.postData })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('shouldn`t create post with incorrect blogId', async () => {
    const blogId = '1234567890';

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send({ blogId, ...postsTestManager.postData })
      .auth(postsTestManager.authUsername, postsTestManager.authPassword)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `BlogId was not found; Received value: ${blogId}`,
            field: 'blogId',
          },
        ],
      });
  });

  it('should update post with correct data', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    const updatedPostData = {
      title: 'New Post',
      shortDescription: 'New short description about post',
      content: 'Some new content',
    };

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .send({
        blogId: blog.id,
        ...updatedPostData,
      })
      .auth(postsTestManager.authUsername, postsTestManager.authPassword)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      id: expect.any(String),
      title: updatedPostData.title,
      shortDescription: updatedPostData.shortDescription,
      content: updatedPostData.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('unauthorized user shouldn`t update post', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    const updatedPostData = {
      title: 'New Post',
      shortDescription: 'New short description about post',
      content: 'Some new content',
    };

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .send({
        blogId: blog.id,
        ...updatedPostData,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('unauthorized user shouldn`t delete post', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should delete post by id', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .auth(postsTestManager.authUsername, postsTestManager.authPassword)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should create comment for post by accessToken', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    const user = await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken,
    );

    expect(comment).toEqual({
      id: expect.any(String),
      content: comment.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: expect.any(String),
      likesInfo: expect.any(Object),
    });
  });

  it('should get comments with paging', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comments = await postsTestManager.createSeveralCommentsForPost(
      post.id,
      accessToken,
      9,
    );

    const { body: responseBody } = (await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/posts/${post.id}/comments?pageSize=5&pageNumber=2&sortDirection=asc&sortBy=content`,
      )
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<BlogViewDto> };

    expect(responseBody.totalCount).toBe(9);
    expect(responseBody.items).toHaveLength(4);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[3]).toEqual(comments[comments.length - 1]);
  });

  it('should change the number of likes and likeStatus', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${post.id}/like-status`)
      .send({ likeStatus: LikeStatus.Like })
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(responseBody.extendedLikesInfo.likesCount).toEqual(1);
    expect(responseBody.extendedLikesInfo.dislikesCount).toEqual(0);
    expect(responseBody.extendedLikesInfo.myStatus).toEqual(LikeStatus.Like);
    expect(responseBody.extendedLikesInfo.newestLikes[0]).toMatchObject({
      addedAt: expect.any(String),
      userId: expect.any(String),
      login: usersTestManager.userData.login,
    });
  });

  it('should change the number of likes and likeStatus from multiple users', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await blogsTestManager.createPost(blog.id);
    const users = await usersTestManager.createSeveralUsers(4);

    const accessTokens = await Promise.all(
      users.map((user) => usersTestManager.login(user.login, '123456789')),
    );

    for (let i = 0; i < users.length; i++) {
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/posts/${post.id}/like-status`)
        .send({ likeStatus: LikeStatus.Like })
        .auth(accessTokens[i].accessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);
    }

    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .auth(accessTokens[1].accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(responseBody.extendedLikesInfo.likesCount).toEqual(4);
    expect(responseBody.extendedLikesInfo.dislikesCount).toEqual(0);
    expect(responseBody.extendedLikesInfo.myStatus).toEqual(LikeStatus.Like);
  });

  it('should correctly update like status for different users', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    const users = await usersTestManager.createSeveralUsers(2);

    const accessTokens = await Promise.all(
      users.map((user) => usersTestManager.login(user.login, '123456789')),
    );

    // User 1 ставит лайк
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${post.id}/like-status`)
      .send({ likeStatus: LikeStatus.Like })
      .auth(accessTokens[0].accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    // User 2 получает пост
    let response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .auth(accessTokens[1].accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body.extendedLikesInfo.likesCount).toEqual(1);
    expect(response.body.extendedLikesInfo.dislikesCount).toEqual(0);
    expect(response.body.extendedLikesInfo.myStatus).toEqual(LikeStatus.None);

    // User 2 ставит дизлайк
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${post.id}/like-status`)
      .send({ likeStatus: LikeStatus.Dislike })
      .auth(accessTokens[1].accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    // User 1 получает пост
    response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${post.id}`)
      .auth(accessTokens[0].accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body.extendedLikesInfo.likesCount).toEqual(1);
    expect(response.body.extendedLikesInfo.dislikesCount).toEqual(1);
    expect(response.body.extendedLikesInfo.myStatus).toEqual(LikeStatus.Like);
  });
});
