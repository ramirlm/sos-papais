import { Test, TestingModule } from '@nestjs/testing';
import { MessageHandlerService } from './message-handler.service';

describe('MessageHandlerService', () => {
  let service: MessageHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageHandlerService],
    }).compile();

    service = module.get<MessageHandlerService>(MessageHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
