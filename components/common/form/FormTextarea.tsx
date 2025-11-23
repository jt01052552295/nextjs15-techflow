'use client';

import {
  FieldError,
  UseFormRegister,
  Path,
  FieldValues,
} from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';

type FormTextareaProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  validMessage?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  minRows?: number;
  maxRows?: number;
  isDirty?: boolean;
  onChange?: () => void;
  onBlur?: () => void;
};

export default function FormTextarea<T extends FieldValues>({
  label,
  name,
  register,
  error,
  validMessage,
  placeholder = '',
  readOnly = false,
  disabled = false,
  className = '',
  textareaClassName = '',
  minRows = 3,
  maxRows = 10,
  isDirty,
  onChange,
  onBlur,
}: FormTextareaProps<T>) {
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
      <TextareaAutosize
        id={name}
        className={`form-control ${getInputClass()} ${textareaClassName}`}
        {...register(name, {
          onChange,
          onBlur,
        })}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        minRows={minRows}
        maxRows={maxRows}
      />
      {error?.message && (
        <div className="invalid-feedback d-block">{error.message}</div>
      )}
      {!error && isDirty && validMessage && (
        <div className="valid-feedback d-block">{validMessage}</div>
      )}
    </div>
  );
}
