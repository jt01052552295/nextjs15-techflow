'use client';

import {
  FieldError,
  UseFormRegister,
  Path,
  FieldValues,
} from 'react-hook-form';

type FormTextFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  validMessage?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  isDirty?: boolean;
  onChange?: () => void;
  onBlur?: () => void;
};

export default function FormTextField<T extends FieldValues>({
  label,
  name,
  register,
  error,
  validMessage,
  placeholder,
  type = 'text',
  readOnly = false,
  disabled = false,
  className = '',
  inputClassName = '',
  isDirty,
  onChange,
  onBlur,
}: FormTextFieldProps<T>) {
  const getInputClass = () => {
    if (error) return 'is-invalid';
    if (isDirty && validMessage) return 'is-valid';
    return '';
  };

  return (
    <div className={className}>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        className={`form-control ${getInputClass()} ${inputClassName}`}
        {...register(name, {
          onChange,
          onBlur,
        })}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
      />
      {error?.message && (
        <div className="invalid-feedback">{error.message}</div>
      )}
      {!error && isDirty && validMessage && (
        <div className="valid-feedback">{validMessage}</div>
      )}
    </div>
  );
}
