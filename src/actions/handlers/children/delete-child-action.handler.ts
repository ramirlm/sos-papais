import { ParentsService } from '../../../parents/parents.service';
import { ChildrenService } from '../../../children/children.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IDeleteChildActionHandlerProps {
  parentsService: ParentsService;
  childrenService: ChildrenService;
  parent: Parent;
}

export class DeleteChildActionHandler extends Action<IDeleteChildActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IDeleteChildActionHandlerProps) {
    const { parentsService, childrenService, parent } = props;

    if (!parent.currentChild) {
      return {
        response: 'Nenhuma criança selecionada.',
        finished: true,
      };
    }

    childrenService.removeChild(parent.currentChild);
    parentsService.update(parent, { currentChild: null });

    return {
      response: 'Criança removida com sucesso.',
      finished: true,
    };
  }
}
