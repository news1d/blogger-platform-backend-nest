export class PasswordRecoveryDto {
  email: string;
}

export class UpdatePasswordRecoveryDto {
  newPassword: string;
  recoveryCode: string;
}
