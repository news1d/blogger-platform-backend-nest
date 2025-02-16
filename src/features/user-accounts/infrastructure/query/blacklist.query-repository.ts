import { InjectModel } from '@nestjs/mongoose';
import { Blacklist, BlacklistModelType } from '../../domain/blacklist.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistQueryRepository {
  constructor(
    @InjectModel(Blacklist.name) private BlacklistModel: BlacklistModelType,
  ) {}

  async getToken(token: string): Promise<boolean> {
    const result = this.BlacklistModel.findOne({ token: token });
    return !!result;
  }
}
