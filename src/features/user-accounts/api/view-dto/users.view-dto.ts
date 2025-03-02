import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.Email;
    dto.login = user.Login;
    dto.id = user.Id.toString();
    dto.createdAt = user.CreatedAt;

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.Email;
    dto.login = user.Login;
    dto.userId = user.Id.toString();

    return dto;
  }
}
