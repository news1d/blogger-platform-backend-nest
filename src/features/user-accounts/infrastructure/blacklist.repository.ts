import {
  Blacklist,
  BlacklistDocument,
  BlacklistModelType,
} from '../domain/blacklist.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlacklistRepository {
  constructor(
    @InjectModel(Blacklist.name) private BlacklistModel: BlacklistModelType,
  ) {}
  async getToken(token: string): Promise<boolean> {
    const result = await this.BlacklistModel.findOne({ token: token });
    return !!result;
  }

  async save(token: BlacklistDocument): Promise<void> {
    await token.save();
  }
}
