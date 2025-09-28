import { ParentsService } from '../../../parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';
import { RemindersService } from '../../../reminders/reminders.service';

interface IDeleteReminderActionHandlerProps {
  parentsService: ParentsService;
  remindersService: RemindersService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class DeleteReminderActionHandler extends Action<IDeleteReminderActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IDeleteReminderActionHandlerProps) {
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
        response: `Digite a opção do lembrete a ser deletado.\n\nLembretes:\n\n${parent.reminders
          .map(
            (reminder, index) =>
              `${index + 1}. ${reminder.message} \n- Data: ${reminder.dueDate.toLocaleDateString('pt-BR')} \n- Hora: ${reminder.dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          )
          .join('\n')}`,
        finished: false,
      };
    }

    if (!parent.conversationState) {
      const numericChoice = Number(body.trim());
      const reminder = parent.reminders[numericChoice - 1];

      if (!reminder) {
        return {
          response:
            'Lembrete não encontrado. Verifique a opção escolhida e tente novamente.',
          finished: false,
        };
      }

      remindersService.remove(reminder);

      parentsService.update(parent, {
        conversationState: '',
        lastChosenOptionId: '',
      });

      return {
        response: 'Lembrete deletado com sucesso.',
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
