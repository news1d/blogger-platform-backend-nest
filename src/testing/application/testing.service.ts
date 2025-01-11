import { Injectable, Inject } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

@Injectable()
export class TestingService {
  constructor(
    @Inject(getConnectionToken()) private readonly connection: Connection, // Инжектим Connection
  ) {}

  async clearDB(): Promise<void> {
    const collections = this.connection.collections;

    for (const key in collections) {
      if (collections.hasOwnProperty(key)) {
        await collections[key].deleteMany({});
      }
    }
  }
}
