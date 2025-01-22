import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { DeletionStatus } from '../../../core/dto/deletion-status';
import { add } from 'date-fns';

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, ...loginConstraints })
  login: string;

  @Prop({ type: String, required: true, unique: true, ...emailConstraints })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({
    type: {
      confirmationCode: { type: String, default: null },
      expirationDate: { type: Date, default: null },
      isConfirmed: { type: Boolean, default: false },
    },
    default: {},
  })
  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  @Prop({
    type: {
      recoveryCode: { type: String, default: null },
      expirationDate: { type: Date, default: null },
    },
    default: {},
  })
  passwordRecovery: {
    recoveryCode: string | null;
    expirationDate: Date | null;
  };

  createdAt: Date;
  updatedAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('User already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  setEmailConfirmationCode(code: string) {
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = add(new Date(), { minutes: 5 });
  }

  setPasswordRecoveryCode(code: string) {
    this.passwordRecovery.recoveryCode = code;
    this.passwordRecovery.expirationDate = add(new Date(), { minutes: 5 });
  }

  updatePasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  updateEmailConfirmationStatus() {
    this.emailConfirmation.isConfirmed = true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
