import { Trim } from '../../../../core/decorators/transform/trim';
import { IsString } from 'class-validator';

export class VerificationCodeInputDTO {
  @Trim()
  @IsString()
  code: string;
}
