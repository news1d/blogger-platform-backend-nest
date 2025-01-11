import { UpdateBlogDto } from '../../dto/create-blog.dto';

export class UpdateBlogInputDto implements UpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}
