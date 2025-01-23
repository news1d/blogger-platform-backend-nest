export class PasswordRecoveryDto {
  email: string;
}

export class NewPasswordRecoveryDto {
  newPassword: string;
  recoveryCode: string;
}
