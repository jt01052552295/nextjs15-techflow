import { ReactNode } from 'react';

type Props = { children: ReactNode; modal: ReactNode };
const RegisterLayout = ({ children, modal }: Props) => {
  return (
    <div data-layout="REGISTER-LAYOUT">
      {children}
      {modal}
    </div>
  );
};

export default RegisterLayout;
