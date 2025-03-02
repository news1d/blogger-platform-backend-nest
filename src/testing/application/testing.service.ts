import { Injectable } from '@nestjs/common';
import { TestingRepository } from '../infrastructure/testing.repository';

@Injectable()
export class TestingService {
  constructor(private testingRepository: TestingRepository) {}

  async clearDB(): Promise<void> {
    return this.testingRepository.clearDB();
  }
}
