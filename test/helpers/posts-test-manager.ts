import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthConfig } from '../../src/features/user-accounts/config/auth.config';
import { CreatePostInputDto } from '../../src/features/bloggers-platform/posts/api/input-dto/posts.input-dto';
import { PostViewDto } from '../../src/features/bloggers-platform/posts/api/view-dto/posts.view-dto';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { delay } from 'rxjs';
import { CreatePostDto } from '../../src/features/bloggers-platform/posts/dto/create-post.dto';
import { CreateCommentInputDto } from '../../src/features/bloggers-platform/comments/api/input-dto/comments.input-dto';
import { CommentViewDto } from '../../src/features/bloggers-platform/comments/api/view-dto/comments.view-dto';

export class PostsTestManager {
  constructor(
    private app: INestApplication,
    private authConfig: AuthConfig,
  ) {}

  authUsername = this.authConfig.authUsername;
  authPassword = this.authConfig.authPassword;

  postData: Omit<CreatePostDto, 'blogId' | 'blogName'> = {
    title: 'First Post',
    shortDescription: 'Short description about post',
    content: 'Some content',
  };

  commentData = {
    content: 'Some comments about post',
  };

  async createPost(
    blogId: string,
    createModel: Omit<CreatePostInputDto, 'blogId'> = this.postData,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send({ ...createModel, blogId: blogId })
      .auth(this.authUsername, this.authPassword)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralPosts(
    blogId: string,
    count: number,
  ): Promise<PostViewDto[]> {
    const postsPromises = [] as Promise<PostViewDto>[];

    for (let i = 0; i < count; i++) {
      await delay(50);
      const response = this.createPost(blogId, {
        title: 'PostTitle' + i,
        shortDescription: 'ShortDescription' + i,
        content: 'SomeContent' + i,
      });
      postsPromises.push(response);
    }

    return Promise.all(postsPromises);
  }

  async createCommentForPost(
    postId: string,
    accessToken: string,
    createModel: CreateCommentInputDto = this.commentData,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralCommentsForPost(
    postId: string,
    accessToken: string,
    count: number,
  ): Promise<CommentViewDto[]> {
    const commentsPromises = [] as Promise<CommentViewDto>[];

    for (let i = 0; i < count; i++) {
      await delay(50);
      const response = this.createCommentForPost(postId, accessToken, {
        content: `Some ${i} comments about post `,
      });
      commentsPromises.push(response);
    }

    return Promise.all(commentsPromises);
  }
}
