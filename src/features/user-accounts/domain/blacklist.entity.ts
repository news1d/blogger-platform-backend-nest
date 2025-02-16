import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type BlacklistDocument = HydratedDocument<Blacklist>;
export type BlacklistModelType = Model<BlacklistDocument> & typeof Blacklist;

@Schema({ timestamps: true })
export class Blacklist {
  @Prop({ type: String, required: true })
  token: string;

  static createInstance(token: string): BlacklistDocument {
    const blacklistToken = new this();
    blacklistToken.token = token;

    return blacklistToken as BlacklistDocument;
  }
}

export const BlacklistSchema = SchemaFactory.createForClass(Blacklist);
BlacklistSchema.loadClass(Blacklist);
