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
  constructor(private readonly props: IDeleteChildActionHandlerProps) {
    super();
  }
  async execute() {
    const { parentsService, childrenService, parent } = this.props;

    if (!parent.currentChild) {
      return {
        response: 'Nenhuma criança selecionada.',
        showMenuOnFinish: true,
      };
    }

    childrenService.removeChild(parent.currentChild);
    parentsService.update(parent, { ...parent, currentChild: null });

    return {
      response: 'Criança removida com sucesso.',
      showMenuOnFinish: true,
    };
  }
}
