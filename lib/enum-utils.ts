import { SelectOption } from '@/components/common/form/FormSelect';

/**
 * Prisma enum을 FormSelect options로 변환
 */
export function enumToSelectOptions(
  enumObj: Record<string, string>,
  labelMap?: Record<string, string>,
): SelectOption[] {
  return Object.entries(enumObj).map(([key, value]) => ({
    value: value,
    label: labelMap?.[value] || key,
  }));
}
