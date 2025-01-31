import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { BlogPost, PostModelType } from '../../posts/domain/post.entity';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(BlogPost.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlogById(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepository.getBlogById(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }

  async deleteBlogById(id: string) {
    const blog = await this.blogsRepository.getBlogById(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }

  async createPostByBlogId(
    blogId: string,
    blogName: string,
    dto: Omit<CreatePostDto, 'blogId'>,
  ): Promise<string> {
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blogName,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }
}
