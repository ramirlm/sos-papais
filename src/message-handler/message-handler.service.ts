import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OllamaAiService } from '../ollama-ai/ollama-ai.service';
import { WhatsappWebService } from '../whatsapp-web/whatsapp-web.service';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { MenusService } from '../menus/menus.service';
import { Option } from '../menus/entities/option.entity';

@Injectable()
export class MessageHandlerService {
  constructor(
    @Inject(forwardRef(() => WhatsappWebService))
    private readonly whatsappClient: WhatsappWebService,
    private readonly parentsService: ParentsService,
    private readonly menusService: MenusService,
  ) {}

  async handleIncomingMessage(incomingMessage: { from: string; body: string }) {
    const { from, body } = incomingMessage;
    const userPhoneNumber = from.replace('whatsapp:', '');

    const parent = await this.parentsService.findByPhone(userPhoneNumber);

    if (!parent) return this.handleNotFoundParent(userPhoneNumber);
    if (!parent.name) return this.handleParentName(userPhoneNumber, body);

    this.handleConversation(parent, body);
  }

  async handleNotFoundParent(phoneNumber: string) {
    this.parentsService.register(phoneNumber);
    this.whatsappClient.sendWhatsAppMessage(
      phoneNumber,
      'Olá! Seja bem-vindo ao SOS Papais, parece que você é novo por aqui, qual o seu nome?',
    );
  }

  async handleParentName(phoneNumber: string, name: string) {
    await this.parentsService.updateName(phoneNumber, name);
    this.whatsappClient.sendWhatsAppMessage(
      phoneNumber,
      `Obrigado por compartilhar seu nome, ${name}! Seja bem-vindo ao SOS Papais! Se precisar de ajuda, é só chamar!`,
    );
  }

  async handleConversation(parent: Parent, body: string) {
    if (!parent.currentMenu) return this.handleInitialMenu(parent);

    const currentMenu = await this.menusService.findOne(parent.currentMenu.id);
    let chosenOption: Option | null = parent.lastChosenOption;

    if (!chosenOption) {
      if (!currentMenu)
        return this.whatsappClient.sendWhatsAppMessage(
          parent.phoneNumber,
          'Desculpe, no momento não há menus disponíveis.',
        );

      chosenOption = currentMenu.options[parseInt(body) - 1];

      if (!chosenOption)
        return this.whatsappClient.sendWhatsAppMessage(
          parent.phoneNumber,
          `Desculpe, a opção escolhida não é válida.\n\nCriança: ${parent.currentChild?.name || 'não selecionada'}\n\nSelecione uma opção válida.\n\n${currentMenu.options.map((opt, index) => `${index + 1}. ${opt.label}${index === currentMenu.options.length - 1 ? '' : '\n'}`).join('')}
        `,
        );
    }

    this.whatsappClient.sendWhatsAppMessage(
      parent.phoneNumber,
      await this.menusService[parent.currentMenu.label](
        parent.currentMenu,
        chosenOption,
        parent,
        body,
      ),
    );
  }

  async handleInitialMenu(parent: Parent) {
    const initialMenu = await this.menusService.findInitialMenu();
    if (!initialMenu)
      return this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        'Desculpe, no momento não há menus disponíveis.',
      );

    await this.whatsappClient.sendWhatsAppMessage(
      parent.phoneNumber,
      `Olá, ${parent.name}!\n\nComo posso te ajudar hoje?\n\nCriança: ${parent.currentChild?.name || 'não selecionada'}\n\n${initialMenu.options.map((opt, index) => `${index + 1}. ${opt.label}${index === initialMenu.options.length - 1 ? '' : '\n'}`).join('')}
      `,
    );

    this.parentsService.updateCurrentMenu(parent.phoneNumber, initialMenu);
  }
}
