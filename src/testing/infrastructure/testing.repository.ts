import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async clearDB(): Promise<void> {
    // Получаем список таблиц
    const tables = await this.dataSource.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);

    const tableNames = tables
      .map((t: { tablename: string }) => `"${t.tablename}"`)
      .join(', ');

    if (tableNames) {
      // Очистка всех таблиц
      await this.dataSource.query(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    }
  }
}
