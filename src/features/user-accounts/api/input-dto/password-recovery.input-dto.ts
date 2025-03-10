import { Trim } from '../../../../core/decorators/transform/trim';
import { IsEmail, IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../domain/user.entity';
import {
  UpdatePasswordRecoveryDto,
  PasswordRecoveryDto,
} from '../../dto/password-recovery.dto';

export class PasswordRecoveryInputDto implements PasswordRecoveryDto {
  @Trim()
  @IsString()
  @IsEmail()
  email: string;
}

export class NewPasswordRecoveryInputDto implements UpdatePasswordRecoveryDto {
  @Trim()
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @Trim()
  @IsString()
  recoveryCode: string;
}
