import { Trim } from '../../../../../core/decorators/transform/trim';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateBlogInputDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 15)
  name: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 500)
  description: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  @Matches(
    /^(https:\/\/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+\/?([a-zA-Z0-9_/-]*)?)$/,
    {
      message: 'Website URL must be a valid HTTPS link.',
    },
  )
  websiteUrl: string;
}
