import { Injectable } from '@nestjs/common';
import { ParentsService } from '../parents/parents.service';
import { ChildrenService } from '../children/children.service';
import { GeminiAiService } from '../gemini-ai/gemini-ai.service';
import { Menu } from './interfaces/menu.interface';
import { AddChildActionHandler } from '../actions/handlers/children/add-child-action.handler';
import { DeleteChildActionHandler } from '../actions/handlers/children/delete-child-action.handler';
import { SelectChildActionHandler } from '../actions/handlers/children/select-child-action.handler';
import { AskAboutChildActionHandler } from '../actions/handlers/children/ask-about-child-action.handler';
import { UpdateNameActionHandler } from '../actions/handlers/user/update-name-action.handler';
import { AddReminderActionHandler } from '../actions/handlers/reminders/add-reminder-action.handler';
import { RemindersService } from '../reminders/reminders.service';
import { ListRemindersActionHandler } from '../actions/handlers/reminders/list-reminders-action.handler';

@Injectable()
export class MenuFactoryService {
  constructor(
    private readonly parentsService: ParentsService,
    private readonly childrenService: ChildrenService,
    private readonly aiService: GeminiAiService,
    private readonly remindersService: RemindersService,
    private readonly addChildHandler: AddChildActionHandler,
    private readonly deleteChildHandler: DeleteChildActionHandler,
    private readonly selectChildHandler: SelectChildActionHandler,
    private readonly askAboutChildHandler: AskAboutChildActionHandler,
    private readonly updateNameHandler: UpdateNameActionHandler,
    private readonly addReminderHandler: AddReminderActionHandler,
    private readonly listRemindersHandler: ListRemindersActionHandler,
  ) {}

  createMenuTree(): Menu {
    const parentsService = this.parentsService;
    const childrenService = this.childrenService;
    const aiService = this.aiService;
    const remindersService = this.remindersService;

    const children: Menu = {
      id: 'children',
      label: 'Crianças',
      options: {
        1: {
          id: 'add-child',
          label: 'Registrar nova criança',
          action: async (parent, message) =>
            await this.addChildHandler.execute({
              parentsService,
              childrenService,
              parent,
              lastChosenOptionId: 'add-child',
              body: message,
            }),
        },
        2: {
          id: 'delete-child',
          label: 'Deletar criança selecionada',
          action: async (parent) =>
            await this.deleteChildHandler.execute({
              parentsService,
              childrenService,
              parent,
            }),
        },
        3: {
          id: 'select-child',
          label: 'Selecionar criança',
          action: async (parent, message) =>
            await this.selectChildHandler.execute({
              parentsService,
              parent,
              lastChosenOptionId: 'select-child',
              body: message,
            }),
        },
        4: {
          id: 'ask-about-child',
          label: 'Perguntar sobre a criança selecionada',
          action: async (parent, message) =>
            await this.askAboutChildHandler.execute({
              parentsService,
              aiService,
              parent,
              lastChosenOptionId: 'ask-about-child',
              body: message,
            }),
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
          action: async (parent, message) =>
            await this.updateNameHandler.execute({
              parentsService,
              parent,
              lastChosenOptionId: 'update-name',
              newName: message,
            }),
        },
      },
    };

    const reminders: Menu = {
      id: 'reminders',
      label: 'Lembretes',
      options: {
        1: {
          id: 'add-reminder',
          label: 'Criar novo lembrete',
          action: async (parent, message) =>
            await this.addReminderHandler.execute({
              parentsService,
              remindersService,
              parent,
              lastChosenOptionId: 'add-reminder',
              body: message,
            }),
        },
        2: {
          id: 'list-reminder',
          label: 'Listar lembretes',
          action: async (parent, message) =>
            await this.listRemindersHandler.execute({
              parent,
            }),
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
        3: {
          id: 'reminders',
          label: 'Lembretes',
          menu: reminders,
        },
      },
    };

    return main;
  }
}
