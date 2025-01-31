import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}
