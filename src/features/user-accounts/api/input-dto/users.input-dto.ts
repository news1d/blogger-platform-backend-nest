import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDto {
  @Trim()
  @IsString()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(loginConstraints.match, {
    message:
      'Login must contain only letters, numbers, underscores, or hyphens.',
  })
  login: string;

  @Trim()
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
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
