import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../core/dto/deletion-status';
import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceDomainDto } from './dto/create-device.domain.dto';

export type DeviceDocument = HydratedDocument<Device>;
export type DeviceModelType = Model<DeviceDocument> & typeof Device;

@Schema({ timestamps: true })
export class Device {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date, required: true })
  issuedAt: Date;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

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

  static createInstance(dto: CreateDeviceDomainDto): DeviceDocument {
    const device = new this();
    device.userId = dto.userId;
    device.deviceId = dto.deviceId;
    device.issuedAt = dto.issuedAt;
    device.deviceName = dto.deviceName;
    device.ip = dto.ip;
    device.expiresAt = dto.expiresAt;

    return device as DeviceDocument;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.loadClass(Device);
