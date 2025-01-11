import { UpdatePostDto } from '../../dto/create-post.dto';

export class UpdatePostInputDto implements UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
