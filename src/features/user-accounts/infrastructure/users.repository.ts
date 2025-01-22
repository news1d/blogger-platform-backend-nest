import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletionStatus } from '../../../core/dto/deletion-status';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getUserByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      login,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      email,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
