import { Child } from '../../children/entities/child.entity';

export function getChildAgeText(child: Child) {
  const childMonths =
    (new Date().getFullYear() - child.birthDate.getFullYear()) * 12 +
    (new Date().getMonth() - child.birthDate.getMonth());

  return childMonths > 12
    ? `${Math.floor(childMonths / 12)} anos${childMonths % 12 > 0 ? ` e ${childMonths % 12} meses` : ''}`
    : `${childMonths} meses`;
}
