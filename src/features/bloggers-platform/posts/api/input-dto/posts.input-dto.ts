import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';

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
  blogId: string;
}
