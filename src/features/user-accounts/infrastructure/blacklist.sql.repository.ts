import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlacklistSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getToken(token: string): Promise<boolean> {
    const query = `SELECT 1 FROM "Blacklist" WHERE "Token" = $1;`;
    const result = await this.dataSource.query(query, [token]);
    return result.length > 0;
  }

  async addToken(token: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO "Blacklist" ("Token") VALUES ($1);`,
      [token],
    );
  }
}
