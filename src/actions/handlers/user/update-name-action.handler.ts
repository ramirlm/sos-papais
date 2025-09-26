import { ParentsService } from 'src/parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IUpdateNameActionHandlerProps {
  parentsService: ParentsService;
  parent: Parent;
  newName: string;
}

export class UpdateNameActionHandler extends Action<IUpdateNameActionHandlerProps> {
  constructor(private readonly props: IUpdateNameActionHandlerProps) {
    super();
  }
  async execute() {
    const { parentsService, parent, newName } = this.props;

    if (!parent.lastChosenOptionId) {
      await parentsService.update(parent, {
        ...parent,
        lastChosenOptionId: 'update_name_action',
      });
      return {
        response: 'Por favor, envie seu nome completo.',
        showMenuOnFinish: false,
      };
    }

    await parentsService.update(parent, {
      ...parent,
      name: newName,
      lastChosenOptionId: '',
    });

    return {
      response: 'Seu nome foi alterado com sucesso.',
      showMenuOnFinish: true,
    };
  }
}
