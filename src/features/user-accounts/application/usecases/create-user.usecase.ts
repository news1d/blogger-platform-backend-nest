import { CryptoService } from '../crypto.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { BadRequestDomainException } from '../../../../core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const userWithTheSameLogin = await this.usersRepository.getUserByLogin(
      dto.login,
    );

    if (!!userWithTheSameLogin) {
      throw BadRequestDomainException.create(
        'This login has already been used',
        'login',
      );
    }

    const userWithTheSameEmail = await this.usersRepository.getUserByEmail(
      dto.email,
    );

    if (!!userWithTheSameEmail) {
      throw BadRequestDomainException.create(
        'This email address has already been used',
        'email',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = await this.usersRepository.createUser({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    return user.Id.toString();
  }
}
