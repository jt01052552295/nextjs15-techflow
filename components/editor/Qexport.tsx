import dynamic from 'next/dynamic';
import { UseFormSetValue, FieldValues } from 'react-hook-form';

const Quploader = dynamic(() => import('./Quploader'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface FormInputProps<T extends FieldValues> {
  label: keyof T;
  errors: any;
  setValue: UseFormSetValue<T>;
  value?: any;
}

function Qexport<T extends FieldValues>({
  label,
  errors,
  setValue,
  value,
}: FormInputProps<T>) {
  return (
    <Quploader
      label={label as string}
      errors={errors}
      setValue={setValue}
      value={value}
    />
  );
}

export default Qexport;
