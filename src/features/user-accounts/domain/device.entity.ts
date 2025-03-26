import { DeletionStatus } from '../../../core/dto/deletion-status';
import { CreateDeviceDomainDto } from './dto/create-device.domain.dto';
import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Device {
  @Index()
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'timestamp', nullable: false })
  issuedAt: Date;

  @Column({ nullable: false })
  deviceName: string;

  @Column({ nullable: false })
  ip: string;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: DeletionStatus,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  updateTokenData(issuedAt: Date, expiresAt: Date) {
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Device already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  static createInstance(dto: CreateDeviceDomainDto): Device {
    const device = new this();
    device.userId = +dto.userId;
    device.id = dto.deviceId;
    device.issuedAt = dto.issuedAt;
    device.deviceName = dto.deviceName;
    device.ip = dto.ip;
    device.expiresAt = dto.expiresAt;

    return device;
  }
}
