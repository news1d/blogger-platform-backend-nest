import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from '../domain/blacklist.entity';

@Injectable()
export class BlacklistRepository {
  constructor(
    @InjectRepository(Blacklist)
    private blacklistRepository: Repository<Blacklist>,
  ) {}

  async getToken(token: string): Promise<boolean> {
    const exists = await this.blacklistRepository.findOneBy({ token });
    return !!exists;
  }

  async save(token: Blacklist): Promise<void> {
    await this.blacklistRepository.save(token);
  }
}
