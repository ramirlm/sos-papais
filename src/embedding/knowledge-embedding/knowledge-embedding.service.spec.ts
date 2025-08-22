import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeEmbeddingService } from './knowledge-embedding.service';

describe('KnowledgeEmbeddingService', () => {
  let service: KnowledgeEmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeEmbeddingService],
    }).compile();

    service = module.get<KnowledgeEmbeddingService>(KnowledgeEmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
