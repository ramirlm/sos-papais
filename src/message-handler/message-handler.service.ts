import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OllamaAiService } from '../ollama-ai/ollama-ai.service';
import { WhatsappWebService } from '../whatsapp-web/whatsapp-web.service';

@Injectable()
export class MessageHandlerService {
  constructor(
    @Inject(forwardRef(() => WhatsappWebService))
    private readonly whatsappClient: WhatsappWebService,
    private readonly ollamaAiService: OllamaAiService,
  ) {}

  async handleIncomingMessage(incomingMessage: { from: string; body: string }) {
    const { from, body } = incomingMessage;
    const userPhoneNumber = from.replace('whatsapp:', '');

    const response = await this.ollamaAiService.generateResponse(body);
    await this.whatsappClient.sendWhatsAppMessage(userPhoneNumber, response);
  }
}
