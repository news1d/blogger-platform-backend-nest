import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto {
  @Trim()
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'Login must contain only letters, numbers, underscores, or hyphens.',
  })
  login: string;

  @Trim()
  @IsString()
  @Length(6, 20)
  password: string;

  @Trim()
  @IsString()
  @IsEmail()
  email: string;
}

export class EmailInputDto {
  @Trim()
  @IsString()
  @IsEmail()
  email: string;
}
