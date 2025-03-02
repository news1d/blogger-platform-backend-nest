import { UpdatePasswordRecoveryDto } from '../../dto/password-recovery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { CryptoService } from '../crypto.service';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class UpdatePasswordCommand {
  constructor(public dto: UpdatePasswordRecoveryDto) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private usersRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: UpdatePasswordCommand): Promise<void> {
    const user = await this.usersRepository.getUserByRecoveryCode(
      dto.recoveryCode,
    );

    if (!user || user.PasswordRecoveryCode !== dto.recoveryCode) {
      throw BadRequestDomainException.create(
        'Recovery code incorrect',
        'recoveryCode',
      );
    }

    if (user.PasswordRecoveryExpiration! < new Date()) {
      throw BadRequestDomainException.create(
        'Recovery code expired',
        'recoveryCode',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.newPassword,
    );

    await this.usersRepository.updatePasswordHash(user.Id, passwordHash);
  }
}
