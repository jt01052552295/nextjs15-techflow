'use client';

import {
  Control,
  Controller,
  FieldError,
  Path,
  FieldValues,
} from 'react-hook-form';
import QEditor from '@/components/editor/QEditor';

type FormEditorProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  placeholder?: string;
  className?: string;
};

export default function FormEditor<T extends FieldValues>({
  label,
  name,
  control,
  error,
  className = '',
}: FormEditorProps<T>) {
  return (
    <div className={className}>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <QEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
            {fieldState.error?.message && (
              <div className="invalid-feedback d-block">
                {fieldState.error.message}
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
