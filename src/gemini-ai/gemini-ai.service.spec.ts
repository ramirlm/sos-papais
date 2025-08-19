import { Test, TestingModule } from '@nestjs/testing';
import { GeminiAiService } from './gemini-ai.service';

describe('GeminiAiService', () => {
  let service: GeminiAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiAiService],
    }).compile();

    service = module.get<GeminiAiService>(GeminiAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
