import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappWebService } from './whatsapp-web.service';

describe('WhatsappWebService', () => {
  let service: WhatsappWebService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappWebService],
    }).compile();

    service = module.get<WhatsappWebService>(WhatsappWebService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
