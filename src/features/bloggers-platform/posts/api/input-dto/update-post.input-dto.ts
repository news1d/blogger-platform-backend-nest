import { UpdatePostDto } from '../../dto/create-post.dto';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BlogIdExists } from '../../application/validators/blogIdExists';

export class UpdatePostInputDto implements UpdatePostDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  title: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  shortDescription: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 1000)
  content: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @BlogIdExists()
  blogId: string;
}
