'use client';

import {
  FieldError,
  UseFormRegister,
  Path,
  FieldValues,
} from 'react-hook-form';

export type SelectOption = {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
};

type FormSelectProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  options: SelectOption[];
  error?: FieldError;
  validMessage?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  onChange?: () => void;
  onBlur?: () => void;
  showPlaceholder?: boolean;
};

export default function FormSelect<T extends FieldValues>({
  label,
  name,
  register,
  options,
  error,
  validMessage,
  placeholder,
  disabled = false,
  className = '',
  selectClassName = '',
  onChange,
  onBlur,
  showPlaceholder = true,
}: FormSelectProps<T>) {
  const getInputClass = () => {
    if (error) return 'is-invalid';
    if (validMessage) return 'is-valid';
    return '';
  };

  return (
    <div className={className}>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        className={`form-select ${getInputClass()} ${selectClassName}`}
        {...register(name, {
          onChange,
          onBlur,
        })}
        disabled={disabled}
        defaultValue=""
      >
        {showPlaceholder && (
          <option value="">{placeholder || '선택하세요'}</option>
        )}
        {options.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error?.message && (
        <div className="invalid-feedback d-block">{error.message}</div>
      )}
      {!error && validMessage && (
        <div className="valid-feedback d-block">{validMessage}</div>
      )}
    </div>
  );
}
