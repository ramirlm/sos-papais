import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OllamaAiService } from '../ollama-ai/ollama-ai.service';
import { WhatsappWebService } from '../whatsapp-web/whatsapp-web.service';
import { ParentsService } from '../parents/parents.service';

@Injectable()
export class MessageHandlerService {
  constructor(
    @Inject(forwardRef(() => WhatsappWebService))
    private readonly whatsappClient: WhatsappWebService,
    private readonly ollamaAiService: OllamaAiService,
    private readonly parentsService: ParentsService,
  ) {}

  async handleIncomingMessage(incomingMessage: { from: string; body: string }) {
    const { from, body } = incomingMessage;
    const userPhoneNumber = from.replace('whatsapp:', '');

    const parent = await this.parentsService.findByPhone(userPhoneNumber);

    if (!parent) return this.handleNotFoundParent(userPhoneNumber);
    if (!parent.name) return this.handleParentName(userPhoneNumber, body);

    const response = await this.ollamaAiService.generateResponse(body);
    await this.whatsappClient.sendWhatsAppMessage(userPhoneNumber, response);
  }

  async handleNotFoundParent(phoneNumber: string) {
    await this.parentsService.register(phoneNumber);
    await this.whatsappClient.sendWhatsAppMessage(
      phoneNumber,
      'Olá! Seja bem-vindo ao SOS Papais, parece que você é novo por aqui, qual o seu nome?',
    );
  }

  async handleParentName(phoneNumber: string, name: string) {
    await this.parentsService.updateName(phoneNumber, name);
    await this.whatsappClient.sendWhatsAppMessage(
      phoneNumber,
      `Obrigado por compartilhar seu nome, ${name}! Como posso ajudar você hoje?`,
    );
  }
}
