import { ReactNode } from 'react';

type Props = { children: ReactNode };
const AuthLayout = ({ children }: Props) => {
  return <div data-layout="AUTH-LAYOUT">{children}</div>;
};

export default AuthLayout;
