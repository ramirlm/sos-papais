import { Menu } from '../../menus/interfaces/menu.interface';

export interface ActionResult {
  response: string;
  finished: boolean;
  rerenderOptions?: boolean;
  menu?: Menu;
}
