import { BlacklistDocument } from '../domain/blacklist.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistRepository {
  async save(token: BlacklistDocument): Promise<void> {
    await token.save();
  }
}
