import { Injectable } from '@nestjs/common';
import { ParentsService } from '../parents/parents.service';
import { ChildrenService } from '../children/children.service';
import { GeminiAiService } from '../gemini-ai/gemini-ai.service';
import { Parent } from '../parents/entities/parent.entity';
import { Menu } from './interfaces/menu.interface';
import { AddChildActionHandler } from '../actions/handlers/children/add-child-action.handler';
import { DeleteChildActionHandler } from '../actions/handlers/children/delete-child-action.handler';
import { SelectChildActionHandler } from '../actions/handlers/children/select-child-action.handler';
import { AskAboutChildActionHandler } from '../actions/handlers/children/ask-about-child-action.handler';
import { UpdateNameActionHandler } from '../actions/handlers/user/update-name-action.handler';
import { CompletedAction } from '../actions/interfaces/completed-action.interface';

@Injectable()
export class MenusService {
  private menuTree: Menu;

  constructor(
    private readonly parentsService: ParentsService,
    private readonly childrenService: ChildrenService,
    private readonly aiService: GeminiAiService,
  ) {
    this.menuTree = this.handleMenuCreation();
  }

  async handleMenuInteraction({
    parent,
    message,
  }: {
    parent: Parent;
    message: string;
  }) {
    // Default to root menu if no current menu is set
    const currentMenu = parent.currentMenuId
      ? this.findMenuById(this.menuTree, parent.currentMenuId)
      : this.menuTree;

    const numericChoice = Number(message.trim());

    // Invalid input (not a number or not a valid option)
    if (isNaN(numericChoice) || !currentMenu?.options[numericChoice]) {
      return {
        response:
          'Desculpe, não entendi sua resposta. Por favor, digite o número da opção.',
        showMenuOnFinish: true,
      } as CompletedAction;
    }

    const selectedOption = currentMenu.options[numericChoice];

    // If this is a navigation option (submenu)
    if (selectedOption.menu) {
      await this.parentsService.update(parent, {
        ...parent,
        currentMenuId: selectedOption.menu.id,
      }); // or save in DB
      return selectedOption.menu;
    }

    // If it's an action
    if (selectedOption.action) {
      const result = await selectedOption.action(parent, message);
      return result;
    }

    return this.menuTree;
  }

  renderMenuOptions(menu: Menu) {
    let renderedMenu = `${menu.label}:\n\n`;

    for (let i = 1; i <= Object.keys(menu.options).length; i++) {
      const option = menu.options[i];
      if (option) {
        renderedMenu += `${i}. ${option.label}\n`;
      }
    }

    renderedMenu += `\nDigite o número da opção ou "menu" para voltar ao menu principal.`;
    return renderedMenu;
  }

  private findMenuById(menu: Menu, id: string): Menu | undefined {
    if (menu.id === id) return menu;

    for (const key in menu.options) {
      const option = menu.options[+key];
      if (option.menu) {
        const found = this.findMenuById(option.menu, id);
        if (found) return found;
      }
    }

    return undefined;
  }

  getMainMenu() {
    return this.menuTree;
  }

  private handleMenuCreation() {
    const parentsService = this.parentsService;
    const childrenService = this.childrenService;
    const aiService = this.aiService;

    const children: Menu = {
      id: 'children',
      label: 'Crianças',
      options: {
        1: {
          id: 'add-child',
          label: 'Registrar nova criança',
          action: async (parent: Parent, message: string) =>
            await new AddChildActionHandler({
              parentsService,
              childrenService,
              parent,
              lastChosenOptionId: parent.lastChosenOptionId,
              body: message,
            }).execute(),
        },
        2: {
          id: 'delete-child',
          label: 'Deletar criança selecionada',
          action: async (parent: Parent) =>
            await new DeleteChildActionHandler({
              parentsService,
              childrenService,
              parent,
            }).execute(),
        },
        3: {
          id: 'select-child',
          label: 'Selecionar criança',
          action: async (parent: Parent, message: string) =>
            await new SelectChildActionHandler({
              parentsService,
              parent,
              lastChosenOptionId: parent.lastChosenOptionId,
              body: message,
            }).execute(),
        },
        4: {
          id: 'ask-about-child',
          label: 'Perguntar sobre a criança selecionada',
          action: async (parent: Parent, message: string) =>
            await new AskAboutChildActionHandler({
              parentsService,
              aiService,
              parent,
              lastChosenOptionId: parent.lastChosenOptionId,
              body: message,
            }).execute(),
        },
      },
    };

    const user: Menu = {
      id: 'user',
      label: 'Usuário',
      options: {
        1: {
          id: 'update-name',
          label: 'Atualizar nome',
          action: async (parent: Parent, message: string) =>
            await new UpdateNameActionHandler({
              parentsService,
              parent,
              newName: message,
            }).execute(),
        },
      },
    };

    const main: Menu = {
      id: 'root',
      label: 'Menu Principal',
      options: {
        1: {
          id: 'children',
          label: 'Crianças',
          menu: children,
        },
        2: {
          id: 'user',
          label: 'Usuário',
          menu: user,
        },
      },
    };

    return main;
  }
}
