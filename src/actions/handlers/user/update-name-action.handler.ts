import { ParentsService } from 'src/parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IUpdateNameActionHandlerProps {
  parentsService: ParentsService;
  parent: Parent;
  lastChosenOptionId: string;
  newName: string;
}

export class UpdateNameActionHandler extends Action<IUpdateNameActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IUpdateNameActionHandlerProps) {
    const { parentsService, parent, lastChosenOptionId, newName } = props;

    if (!parent.lastChosenOptionId) {
      await parentsService.update(parent, {
        lastChosenOptionId,
      });
      return {
        response: 'Por favor, envie seu nome completo.',
        finished: false,
      };
    }

    await parentsService.update(parent, {
      name: newName,
      lastChosenOptionId: '',
    });

    return {
      response: 'Seu nome foi alterado com sucesso.',
      finished: true,
    };
  }
}
