import { ActionResult } from '../../actions/interfaces/completed-action.interface';
import { Parent } from '../../parents/entities/parent.entity';
import { Menu } from './menu.interface';

export interface MenuOption {
  id: string;
  label: string;
  action?: (parent: Parent, message: string) => Promise<ActionResult>;
  menu?: Menu;
}
