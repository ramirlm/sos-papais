import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WhatsappWebService } from '../whatsapp-web/whatsapp-web.service';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { MenusService } from '../menus/menus.service';
import { Menu } from '../menus/interfaces/menu.interface';
import { CompletedAction } from '../actions/interfaces/completed-action.interface';

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
    const isParentRegistered = parent && parent.name;

    if (isParentRegistered) {
      this.handleConversation(parent, body);
    } else {
      this.handleRegister({
        parent,
        phoneNumber: userPhoneNumber,
        message: body,
      });
    }
  }

  async handleRegister({
    parent,
    phoneNumber,
    message,
  }: {
    parent: Parent | null;
    phoneNumber: string;
    message: string;
  }) {
    await this.parentsService.register({
      phoneNumber,
      message,
    });

    if (!parent) {
      this.whatsappClient.sendWhatsAppMessage(
        phoneNumber,
        'Olá! Seja bem-vindo ao SOS Papais, parece que você é novo por aqui, qual o seu nome?',
      );
    } else {
      await this.whatsappClient.sendWhatsAppMessage(
        phoneNumber,
        `Obrigado por compartilhar seu nome, ${parent.name}! Seja bem-vindo ao SOS Papais!`,
      );
    }
  }

  async handleConversation(parent: Parent, body: string) {
    const result = await this.menusService.handleMenuInteraction({
      parent,
      message: body,
    });

    if ((result as Menu)?.label) {
      const menu = result as Menu;
      const isMainMenu = menu.id === 'root';
      const greetingMessage = `Olá ${parent.name}! Como posso te ajudar?\n\n`;
      const renderedMenu = this.menusService.renderMenuOptions(menu);
      this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        isMainMenu ? greetingMessage + renderedMenu : renderedMenu,
      );
    } else {
      const completedAction = result as CompletedAction;
      this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        completedAction.response,
      );
      if (completedAction.showMenuOnFinish) {
        const menu = this.menusService.getMainMenu();
        this.whatsappClient.sendWhatsAppMessage(
          parent.phoneNumber,
          this.menusService.renderMenuOptions(menu),
        );
      }
      this.parentsService.update(parent, {
        ...parent,
        lastChosenOptionId: '',
        currentMenuId: '',
      });
    }
  }
}
