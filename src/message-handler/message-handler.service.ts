import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WhatsappWebService } from '../whatsapp-web/whatsapp-web.service';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { MenusService } from '../menus/menus.service';
import { Menu } from '../menus/interfaces/menu.interface';
import { ActionResult } from '../actions/interfaces/completed-action.interface';

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
    const revalidatedParent = await this.parentsService.register({
      phoneNumber,
      message,
    });

    if (!parent) {
      await this.whatsappClient.sendWhatsAppMessage(
        phoneNumber,
        'Olá! Seja bem-vindo ao SOS Papais, parece que você é novo por aqui, qual o seu nome?',
      );
    } else {
      await await this.whatsappClient.sendWhatsAppMessage(
        phoneNumber,
        `Obrigado por compartilhar seu nome, ${revalidatedParent?.name}! Seja bem-vindo ao SOS Papais!`,
      );

      if (revalidatedParent) this.handleConversation(revalidatedParent, '');
    }
  }

  async handleConversation(parent: Parent, body: string) {
    const greetingMessage = `Olá ${parent.name}! Como posso te ajudar?\n\n`;
    const currentChildMessage = `Criança selectionada: ${parent.currentChild?.name || 'Nenhuma criança selecionada'}\n\n`;

    if (body === '0') {
      const menu = this.menusService.getMainMenu();
      await this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        greetingMessage +
          currentChildMessage +
          this.menusService.renderMenuOptions(menu),
      );
      this.parentsService.update(parent, {
        conversationState: '',
        currentMenuId: 'root',
        lastChosenOptionId: '',
        contextSummary: '',
      });
      return;
    }

    const result = await this.menusService.handleMenuInteraction({
      parent,
      message: body,
    });

    if ((result as Menu)?.label) {
      const menu = result as Menu;
      const isMainMenu = menu.id === 'root';
      const renderedMenu = this.menusService.renderMenuOptions(menu);
      await this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        isMainMenu
          ? greetingMessage + currentChildMessage + renderedMenu
          : renderedMenu,
      );
    } else {
      const actionResult = result as ActionResult;
      await this.whatsappClient.sendWhatsAppMessage(
        parent.phoneNumber,
        actionResult.response,
      );
      if (actionResult.finished) {
        const menu = this.menusService.getMainMenu();
        await this.whatsappClient.sendWhatsAppMessage(
          parent.phoneNumber,
          this.menusService.renderMenuOptions(menu),
        );
        this.parentsService.update(parent, {
          conversationState: '',
          currentMenuId: 'root',
          lastChosenOptionId: '',
          contextSummary: '',
        });
      }
      if (actionResult.rerenderOptions && actionResult.menu) {
        await this.whatsappClient.sendWhatsAppMessage(
          parent.phoneNumber,
          this.menusService.renderMenuOptions(actionResult.menu),
        );
      }
    }
  }
}
