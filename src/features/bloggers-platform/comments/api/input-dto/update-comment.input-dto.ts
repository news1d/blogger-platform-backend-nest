import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}
