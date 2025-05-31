import {
  UseFormTrigger,
  FieldErrors,
  UseFormWatch,
  FieldValues,
  Path,
} from 'react-hook-form';
import { get } from 'lodash';

type UseFormUtilsProps<T extends FieldValues> = {
  trigger: UseFormTrigger<T>;
  errors: FieldErrors<T>;
  watch: UseFormWatch<T>;
  setErrorMessage: (message: string) => void;
};

const useFormUtils = <T extends FieldValues>({
  trigger,
  errors,
  watch,
  setErrorMessage,
}: UseFormUtilsProps<T>) => {
  const handleInputChange = async (field: Path<T>) => {
    await trigger(field);
    setErrorMessage('');
  };

  const getInputClass = (field: Path<T>) => {
    const error = get(errors, field); // 중첩된 경로 지원
    const value = watch(field);
    if (!value && !error) return '';
    return error || !value ? 'is-invalid' : 'is-valid';
  };

  return { handleInputChange, getInputClass };
};

export default useFormUtils;
