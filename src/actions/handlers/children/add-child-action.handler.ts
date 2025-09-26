import { ParentsService } from '../../../parents/parents.service';
import { ChildrenService } from '../../../children/children.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IAddChildActionHandlerProps {
  parentsService: ParentsService;
  childrenService: ChildrenService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class AddChildActionHandler extends Action<IAddChildActionHandlerProps> {
  constructor(private readonly props: IAddChildActionHandlerProps) {
    super();
  }
  async execute() {
    const {
      parentsService,
      childrenService,
      parent,
      lastChosenOptionId,
      body,
    } = this.props;

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, { ...parent, lastChosenOptionId });
      return {
        response: 'Por favor, envie o nome da criança.',
        showMenuOnFinish: false,
      };
    }

    if (!parent.conversationState) {
      const child = await childrenService.createChild(parent, body);

      parentsService.update(parent, {
        ...parent,
        conversationState: 'waiting_for_dob',
      });

      parentsService.update(parent, { ...parent, currentChild: child });

      return {
        response:
          'Certo! Agora envie a data de nascimento da criança. (DD/MM/AAAA)',
        showMenuOnFinish: false,
      };
    }

    if (parent.conversationState === 'waiting_for_dob') {
      if (!parent.currentChild) {
        return {
          response: 'Nenhuma criança selecionada.',
          showMenuOnFinish: false,
        };
      }

      const response = await childrenService.updateChildDob(
        parent.currentChild,
        body,
      );

      if (response) return { response, showMenuOnFinish: false };

      parentsService.update(parent, {
        ...parent,
        conversationState: '',
        lastChosenOptionId: '',
      });

      return {
        response: 'Data de nascimento da criança atualizada com sucesso.',
        showMenuOnFinish: true,
      };
    }

    parentsService.update(parent, {
      ...parent,
      conversationState: '',
      lastChosenOptionId: '',
    });

    return {
      response: 'Voltando para o menu inicial...',
      showMenuOnFinish: true,
    };
  }
}
