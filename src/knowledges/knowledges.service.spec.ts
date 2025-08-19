import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgesService } from './knowledges.service';

describe('KnowledgesService', () => {
  let service: KnowledgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgesService],
    }).compile();

    service = module.get<KnowledgesService>(KnowledgesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
