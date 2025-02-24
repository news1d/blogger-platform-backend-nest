import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { PostsTestManager } from './helpers/posts-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { LikeStatus } from '../src/core/dto/like-status';

describe('comments', () => {
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

  it('should get comment by id', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken,
    );

    expect(comment.likesInfo.likesCount).toEqual(0);
    expect(comment.likesInfo.dislikesCount).toEqual(0);
    expect(comment.likesInfo.myStatus).toEqual(LikeStatus.None);

    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .expect(HttpStatus.OK, comment);

    expect(responseBody.likesInfo.likesCount).toEqual(0);
    expect(responseBody.likesInfo.dislikesCount).toEqual(0);
    expect(responseBody.likesInfo.myStatus).toEqual(LikeStatus.None);
  });

  it('should delete comment by id', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken,
    );

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('shouldn`t delete comment that is owned by another user', async () => {
    const firstUserData = {
      login: 'pashgun',
      password: 'password1',
      email: 'pashgun@gmail.com',
    };

    const secondUserData = {
      login: 'easygogame',
      password: 'password1',
      email: 'easygogame@gmail.com',
    };

    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);

    await usersTestManager.createUser(firstUserData);
    await usersTestManager.createUser(secondUserData);

    const { accessToken: accessToken1 } = await usersTestManager.login(
      firstUserData.login,
      firstUserData.password,
    );

    const { accessToken: accessToken2 } = await usersTestManager.login(
      secondUserData.login,
      secondUserData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken1,
    );

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken2, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should update comment by id', async () => {
    const updatedCommentData = {
      content: 'Some new comments about post',
    };

    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken,
    );

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .send(updatedCommentData)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .expect(HttpStatus.OK, {
        ...comment,
        content: updatedCommentData.content,
      });
  });

  it('should change the number of likes and likeStatus', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost(blog.id);
    await usersTestManager.createUser();

    const { accessToken } = await usersTestManager.login(
      usersTestManager.userData.login,
      usersTestManager.userData.password,
    );

    const comment = await postsTestManager.createCommentForPost(
      post.id,
      accessToken,
    );

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${comment.id}/like-status`)
      .send({ likeStatus: LikeStatus.Like })
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(responseBody.likesInfo.likesCount).toEqual(1);
    expect(responseBody.likesInfo.dislikesCount).toEqual(0);
    expect(responseBody.likesInfo.myStatus).toEqual(LikeStatus.Like);
  });
});
