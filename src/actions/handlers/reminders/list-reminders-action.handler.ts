import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IListRemindersActionHandlerProps {
  parent: Parent;
}

export class ListRemindersActionHandler extends Action<IListRemindersActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IListRemindersActionHandlerProps) {
    const { parent } = props;

    return {
      response: `Lembretes:\n\n${parent.reminders
        .map(
          (reminder, index) =>
            `${index + 1}. ${reminder.message} \n- Data: ${reminder.dueDate.toLocaleDateString('pt-BR')} \n- Hora: ${reminder.dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        )
        .join('\n')}`,
      finished: true,
    };
  }
}
