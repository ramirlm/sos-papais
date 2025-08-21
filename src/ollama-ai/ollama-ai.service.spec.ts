import { Test, TestingModule } from '@nestjs/testing';
import { OllamaAiService } from './ollama-ai.service';

describe('OllamaAiService', () => {
  let service: OllamaAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OllamaAiService],
    }).compile();

    service = module.get<OllamaAiService>(OllamaAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
