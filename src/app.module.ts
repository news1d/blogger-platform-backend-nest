import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './features/user-accounts/api/users.controller';
import { UsersService } from './features/user-accounts/application/users.service';
import { UsersRepository } from './features/user-accounts/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './features/user-accounts/domain/user.entity';
import {
  Blog,
  BlogSchema,
} from './features/bloggers-platform/blogs/domain/blog.entity';
import { BlogsController } from './features/bloggers-platform/blogs/api/blogs.controller';
import { BlogsService } from './features/bloggers-platform/blogs/application/blogs.service';
import { BlogsRepository } from './features/bloggers-platform/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './features/bloggers-platform/blogs/infrastructure/query/blogs.query-repository';
import { UsersQueryRepository } from './features/user-accounts/infrastructure/query/users.query-repository';
import {
  BlogPost,
  PostSchema,
} from './features/bloggers-platform/posts/domain/post.entity';
import { PostsController } from './features/bloggers-platform/posts/api/posts.controller';
import { PostsService } from './features/bloggers-platform/posts/application/posts.service';
import { PostsRepository } from './features/bloggers-platform/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/bloggers-platform/posts/infrastructure/query/posts.query-repository';
import { CommentsController } from './features/bloggers-platform/comments/api/comments.controller';
import { CommentsQueryRepository } from './features/bloggers-platform/comments/infrastructure/query/comments.query-repository';
import {
  CommentSchema,
  PostComment,
} from './features/bloggers-platform/comments/domain/comment.entity';
import { TestingController } from './testing/api/testing.controller';
import { TestingService } from './testing/application/testing.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Blog.name, schema: BlogSchema },
      { name: BlogPost.name, schema: PostSchema },
      { name: PostComment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    TestingService,
  ],
})
export class AppModule {}
