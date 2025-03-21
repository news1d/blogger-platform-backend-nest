import { configModule } from './config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './features/user-accounts/api/users.controller';
import {
  BlogsController,
  BlogsSaController,
} from './features/bloggers-platform/blogs/api/blogs.controller';
import { PostsController } from './features/bloggers-platform/posts/api/posts.controller';
import { CommentsController } from './features/bloggers-platform/comments/api/comments.controller';
import { TestingController } from './testing/api/testing.controller';
import { TestingService } from './testing/application/testing.service';
import { CryptoService } from './features/user-accounts/application/crypto.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './features/notifications/email.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './features/user-accounts/api/auth.controller';
import { AuthService } from './features/user-accounts/application/auth.service';
import { AuthQueryRepository } from './features/user-accounts/infrastructure/query/auth.query-repository';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './features/user-accounts/guards/local/local.strategy';
import { JwtStrategy } from './features/user-accounts/guards/bearer/jwt.strategy';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { EmailConfig } from './features/notifications/email.config';
import { EmailModule } from './features/notifications/email.module';
import { UserModule } from './features/user-accounts/user-accounts.module';
import { JwtConfig } from './features/user-accounts/config/jwt.config';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions-filter';
import { CreateUserUseCase } from './features/user-accounts/application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './features/user-accounts/application/usecases/delete-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUseCase } from './features/user-accounts/application/usecases/register-user.usecase';
import { LoginUserUseCase } from './features/user-accounts/application/usecases/login-user.usecase';
import { UpdatePasswordUseCase } from './features/user-accounts/application/usecases/update-password.usecase';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './features/user-accounts/constants/auth-tokens.inject-constants';
import { PasswordRecoveryUseCase } from './features/user-accounts/application/usecases/password-recovery.usecase';
import { RegistrationConfirmationUseCase } from './features/user-accounts/application/usecases/registration-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './features/user-accounts/application/usecases/registration-email-resending.usecase';
import { CreateBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/delete-blog.usecase';
import { CreatePostForBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/create-post-for-blog.usecase';
import { CreatePostUseCase } from './features/bloggers-platform/posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './features/bloggers-platform/posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './features/bloggers-platform/posts/application/usecases/delete-post.usecase';
import { CreateCommentForPostUseCase } from './features/bloggers-platform/posts/application/usecases/create-comment-for-post.usecase';
import { UpdateLikeStatusOnPostUseCase } from './features/bloggers-platform/posts/application/usecases/update-like-status-on-post.usecase';
import { UpdateLikeStatusOnCommentUseCase } from './features/bloggers-platform/comments/application/usecases/update-like-status-on-comment.usecase';
import { UpdateCommentUseCase } from './features/bloggers-platform/comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './features/bloggers-platform/comments/application/usecases/delete-comment.usecase';
import { BlogIdExistsValidator } from './features/bloggers-platform/posts/application/validators/blogIdExists';
import { SecurityDevicesController } from './features/user-accounts/api/security-devices.controller';
import { RefreshTokenStrategy } from './features/user-accounts/guards/bearer/refresh-token.strategy';
import { TerminateAllOtherDevicesUseCase } from './features/user-accounts/application/usecases/terminate-all-other-devices.usecase';
import { TerminateDeviceUseCase } from './features/user-accounts/application/usecases/terminate-device.usecase';
import { RefreshTokenUseCase } from './features/user-accounts/application/usecases/refresh-token.usecase';
import { LogoutUserUseCase } from './features/user-accounts/application/usecases/logout-user.usecase';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './features/user-accounts/infrastructure/users.repository';
import { UsersQueryRepository } from './features/user-accounts/infrastructure/query/users.query-repository';
import { TestingRepository } from './testing/infrastructure/testing.repository';
import { SecurityDevicesQueryRepository } from './features/user-accounts/infrastructure/query/security-devices.query-repository';
import { SecurityDevicesRepository } from './features/user-accounts/infrastructure/security-devices.repository';
import { BlacklistRepository } from './features/user-accounts/infrastructure/blacklist.repository';
import { BlogsQueryRepository } from './features/bloggers-platform/blogs/infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from './features/bloggers-platform/posts/infrastructure/query/posts.query-repository';
import { PostsRepository } from './features/bloggers-platform/posts/infrastructure/posts.repository';
import { BlogsRepository } from './features/bloggers-platform/blogs/infrastructure/blogs.repository';
import { DeletePostFromBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/delete-post-from-blog.usecase';
import { UpdatePostFromBlogUseCase } from './features/bloggers-platform/blogs/application/usecases/update-post-from-blog.usecase';
import { CommentsRepository } from './features/bloggers-platform/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './features/bloggers-platform/comments/infrastructure/query/comments.query-repository';
import { User } from './features/user-accounts/domain/user.entity';
import { Device } from './features/user-accounts/domain/device.entity';
import { Blacklist } from './features/user-accounts/domain/blacklist.entity';
import { UserMeta } from './features/user-accounts/domain/user-meta.entity';
import { Blog } from './features/bloggers-platform/blogs/domain/blog.entity';
import { Post } from './features/bloggers-platform/posts/domain/post.entity';
import { Comment } from './features/bloggers-platform/comments/domain/comment.entity';
import { CommentLike } from './features/bloggers-platform/comments/domain/comment-like.entity';
import { PostLike } from './features/bloggers-platform/posts/domain/post-like.entity';

const userUseCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  UpdatePasswordUseCase,
  PasswordRecoveryUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  LogoutUserUseCase,
  RefreshTokenUseCase,
];

const blogUseCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostForBlogUseCase,
  DeletePostFromBlogUseCase,
  UpdatePostFromBlogUseCase,
];

const postUseCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentForPostUseCase,
  UpdateLikeStatusOnPostUseCase,
];

const commentUseCases = [
  UpdateCommentUseCase,
  UpdateLikeStatusOnCommentUseCase,
  DeleteCommentUseCase,
];

const securityDevicesUseCases = [
  TerminateAllOtherDevicesUseCase,
  TerminateDeviceUseCase,
];

@Module({
  imports: [
    configModule,
    CoreModule,
    EmailModule,
    UserModule,
    CqrsModule,
    JwtModule,
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        return {
          type: 'postgres',
          host: coreConfig.dbHost,
          port: coreConfig.dbPort,
          username: coreConfig.dbUser,
          password: coreConfig.dbPassword,
          database: coreConfig.dbName,
          ssl: true,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [CoreConfig],
    }),
    TypeOrmModule.forFeature([
      User,
      UserMeta,
      Device,
      Blacklist,
      Blog,
      Post,
      Comment,
      CommentLike,
      PostLike,
    ]),
    MailerModule.forRootAsync({
      useFactory: (emailConfig: EmailConfig) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: emailConfig.emailAddress,
            pass: emailConfig.emailPassword,
          },
        },
        defaults: {
          from: `SonicBitService <${emailConfig.emailAddress}>`,
        },
      }),
      inject: [EmailConfig],
    }),
    ThrottlerModule.forRoot([
      // {
      //   ttl: seconds(10),
      //   limit: 5,
      // },
    ]),
    PassportModule,
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    BlogsSaController,
    PostsController,
    CommentsController,
    TestingController,
    AuthController,
    SecurityDevicesController,
  ],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (jwtConfig: JwtConfig) => {
        return new JwtService({
          secret: jwtConfig.jwtSecret,
          signOptions: { expiresIn: '5m' },
        });
      },
      inject: [JwtConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (jwtConfig: JwtConfig) => {
        return new JwtService({
          secret: jwtConfig.refreshSecret,
          signOptions: { expiresIn: '10m' },
        });
      },
      inject: [JwtConfig],
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    UsersRepository,
    UsersQueryRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    TestingRepository,
    TestingService,
    CryptoService,
    EmailService,
    AuthService,
    AuthQueryRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    AllExceptionsFilter,
    BlogIdExistsValidator,
    SecurityDevicesQueryRepository,
    SecurityDevicesRepository,
    BlacklistRepository,
    ...userUseCases,
    ...blogUseCases,
    ...postUseCases,
    ...commentUseCases,
    ...securityDevicesUseCases,
  ],
})
export class AppModule {}
