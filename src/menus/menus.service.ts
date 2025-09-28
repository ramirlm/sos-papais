import { Injectable } from '@nestjs/common';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { Menu } from './interfaces/menu.interface';
import { MenuFactoryService } from './menu-factory.service';

@Injectable()
export class MenusService {
  private menuTree: Menu;

  constructor(
    private readonly parentsService: ParentsService,
    private readonly menuFactory: MenuFactoryService,
  ) {
    this.menuTree = this.menuFactory.createMenuTree();
  }

  async handleMenuInteraction({
    parent,
    message,
  }: {
    parent: Parent;
    message: string;
  }) {
    // Resume ongoing action if any
    if (parent.lastChosenOptionId) {
      return await this.resumeOngoingAction(parent, message);
    }

    // Initialize menu for new parent
    if (!parent.currentMenuId) {
      await this.setCurrentMenu(parent, this.menuTree.id);
      return this.menuTree;
    }

    const currentMenu =
      this.findMenuById(this.menuTree, parent.currentMenuId) || this.menuTree;

    const numericChoice = Number(message.trim());

    if (!this.isValidChoice(currentMenu, numericChoice)) {
      return this.invalidChoiceResponse(currentMenu);
    }

    const selectedOption = currentMenu.options[numericChoice];

    // Navigation
    if (selectedOption.menu) {
      await this.setCurrentMenu(parent, selectedOption.menu.id);
      return selectedOption.menu;
    }

    // Execute action
    if (selectedOption.action) {
      return await selectedOption.action(parent, message);
    }

    // Fallback
    return this.menuTree;
  }

  renderMenuOptions(menu: Menu) {
    let renderedMenu = `${menu.label}:\n\n`;
    for (let i = 1; i <= Object.keys(menu.options).length; i++) {
      const option = menu.options[i];
      if (option) renderedMenu += `${i}. ${option.label}\n`;
    }
    renderedMenu += `\nDigite o número da opção ou *0* para voltar ao menu principal.`;
    return renderedMenu;
  }

  getMainMenu() {
    return this.menuTree;
  }

  private isValidChoice(menu: Menu | undefined, choice: number) {
    return menu && !isNaN(choice) && !!menu.options[choice];
  }

  private invalidChoiceResponse(menu: Menu | undefined) {
    return {
      response: 'Por favor, digite uma opção válida.',
      finished: false,
      rerenderOptions: true,
      menu,
    };
  }

  private async setCurrentMenu(parent: Parent, menuId: string) {
    await this.parentsService.update(parent, {
      currentMenuId: menuId,
    });
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

  private findOptionById(menu: Menu, optionId: string) {
    for (const key in menu.options) {
      const option = menu.options[key];
      if (option.id === optionId) return option;

      if (option.menu) {
        const found = this.findOptionById(option.menu, optionId);
        if (found) return found;
      }
    }
    return null;
  }

  private async resumeOngoingAction(parent: Parent, message: string) {
    const optionId = parent.lastChosenOptionId;
    const option = this.findOptionById(this.menuTree, optionId!);

    if (!option || !option.action) {
      await this.clearActionState(parent);
      return {
        response: 'Algo deu errado. Voltando ao menu principal.',
        finished: true,
        rerenderOptions: true,
        menu: this.menuTree,
      };
    }

    return await option.action(parent, message);
  }

  private async clearActionState(parent: Parent) {
    await this.parentsService.update(parent, {
      currentMenuId: 'root',
      lastChosenOptionId: '',
      conversationState: '',
    });
  }
}
