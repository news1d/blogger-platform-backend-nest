import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogPost, PostModelType } from '../domain/post.entity';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(BlogPost.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.getBlogById(dto.blogId);
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePostById(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.getPostById(id);

    post.update(dto);

    await this.postsRepository.save(post);
  }

  async deletePostById(id: string) {
    const post = await this.postsRepository.getPostById(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
