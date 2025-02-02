import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { BlogIdExists } from '../../application/validators/blogIdExists';

export class CreatePostInputDto {
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
  @IsMongoId()
  @BlogIdExists({ message: 'Blog ID was not found.' })
  blogId: string;
}
