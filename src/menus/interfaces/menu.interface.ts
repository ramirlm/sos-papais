import { MenuOption } from './menu-option.interface';

export interface Menu {
  id: string;
  label: string;
  options: Record<string, MenuOption>;
}
