import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { add } from 'date-fns';
import { User } from './user.entity';

@Entity()
export class UserMeta {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, (user) => user.userMeta)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ nullable: true })
  emailConfirmationCode: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  emailConfirmationExpiration: Date;

  @Column({ type: 'boolean', default: false })
  isEmailConfirmed: boolean;

  @Index()
  @Column({ nullable: true })
  passwordRecoveryCode: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  passwordRecoveryExpiration: Date;

  static createInstance(user: User): UserMeta {
    const userMeta = new this();
    userMeta.userId = user.id;
    userMeta.user = user;
    return userMeta;
  }

  setEmailConfirmationCode(code: string) {
    this.emailConfirmationCode = code;
    this.emailConfirmationExpiration = add(new Date(), { minutes: 5 });
  }

  setPasswordRecoveryCode(code: string) {
    this.passwordRecoveryCode = code;
    this.passwordRecoveryExpiration = add(new Date(), { minutes: 5 });
  }

  updateEmailConfirmationStatus() {
    this.isEmailConfirmed = true;
  }
}
