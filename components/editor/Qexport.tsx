import dynamic from 'next/dynamic';

const Quploader = dynamic(() => import('./Quploader'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface FormInputProps {
  label: string;
  errors: any;
  setValue?: any;
  value?: any;
}

function Qexport({ label, errors, setValue, value }: FormInputProps) {
  return (
    <Quploader
      label={label}
      errors={errors}
      setValue={setValue}
      value={value}
    />
  );
}

export default Qexport;
