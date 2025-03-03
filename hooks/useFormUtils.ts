import {
  UseFormTrigger,
  FieldErrors,
  UseFormWatch,
  FieldValues,
  Path,
} from 'react-hook-form';

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
    const value = watch(field);
    if (!value && !errors[field]) {
      return '';
    }
    return errors[field] || !value ? 'is-invalid' : 'is-valid';
  };

  return { handleInputChange, getInputClass };
};

export default useFormUtils;
