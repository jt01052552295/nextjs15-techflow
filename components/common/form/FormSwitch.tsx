'use client';

import {
  FieldError,
  UseFormRegister,
  Path,
  FieldValues,
} from 'react-hook-form';

type FormSwitchProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  disabled?: boolean;
  className?: string;
  switchLabel?: string;
  isDirty?: boolean;
  onChange?: () => void;
  onBlur?: () => void;
};

export default function FormSwitch<T extends FieldValues>({
  label,
  name,
  register,
  error,
  disabled = false,
  className = 'mb-2',
  switchLabel,
  isDirty,
  onChange,
  onBlur,
}: FormSwitchProps<T>) {
  const id = `switch-${name}`;

  return (
    <div className={className}>
      <label className="form-label d-block">{label}</label>
      <div className="form-check form-switch mt-2">
        <input
          type="checkbox"
          className={`form-check-input ${error ? 'is-invalid' : ''} ${!error && isDirty ? 'is-valid' : ''}`}
          id={id}
          {...register(name, {
            onChange,
            onBlur,
          })}
          disabled={disabled}
        />
        {switchLabel && (
          <label className="form-check-label" htmlFor={id}>
            {switchLabel}
          </label>
        )}
        {error?.message && (
          <div className="invalid-feedback d-block">{error.message}</div>
        )}
      </div>
    </div>
  );
}
