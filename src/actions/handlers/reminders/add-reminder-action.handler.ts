import { ParentsService } from '../../../parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';
import { RemindersService } from '../../../reminders/reminders.service';

interface IAddReminderActionHandlerProps {
  parentsService: ParentsService;
  remindersService: RemindersService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class AddReminderActionHandler extends Action<IAddReminderActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IAddReminderActionHandlerProps) {
    const {
      parentsService,
      remindersService,
      parent,
      lastChosenOptionId,
      body,
    } = props;

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, { lastChosenOptionId });
      return {
        response: 'Informe a mensagem do lembrete.',
        finished: false,
      };
    }

    if (!parent.conversationState) {
      const reminder = await remindersService.create(parent, body);
      if (!reminder) {
        return {
          response: 'Lembrete não encontrado.',
          finished: false,
        };
      }

      parentsService.update(parent, {
        conversationState: 'waiting_for_reminder_due_date',
        lastCreatedReminder: reminder,
      });

      return {
        response: 'Certo! Agora envie a data do lembrete. (DD/MM/AAAA)',
        finished: false,
      };
    }

    if (parent.conversationState === 'waiting_for_reminder_due_date') {
      const reminder = await remindersService.findLastCreatedReminder(parent);
      if (!reminder) {
        return {
          response: 'Lembrete não encontrado.',
          finished: false,
        };
      }

      const response = await remindersService.updateReminderDueDate(
        reminder,
        body,
      );

      if (response) return { response, finished: false };

      parentsService.update(parent, {
        conversationState: 'waiting_for_reminder_day_time',
      });

      return {
        response: 'Certo! Agora envie o horário do lembrete. (HH:MM)',
        finished: false,
      };
    }

    if (parent.conversationState === 'waiting_for_reminder_day_time') {
      const reminder = await remindersService.findLastCreatedReminder(parent);
      if (!reminder) {
        return {
          response: 'Lembrete não encontrado.',
          finished: false,
        };
      }

      const response = await remindersService.updateReminderDayTime(
        reminder,
        body,
      );

      if (response) return { response, finished: false };

      parentsService.update(parent, {
        conversationState: '',
        lastChosenOptionId: '',
      });

      return {
        response: 'Horário definido com sucesso.',
        finished: true,
      };
    }

    parentsService.update(parent, {
      conversationState: '',
      lastChosenOptionId: '',
    });

    return {
      response: 'Voltando para o menu inicial...',
      finished: true,
    };
  }
}
