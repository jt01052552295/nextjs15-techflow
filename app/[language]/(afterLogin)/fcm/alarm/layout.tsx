import { Fragment, ReactNode } from 'react';

type Props = { children: ReactNode };

const PqLayout = ({ children }: Props) => {
  return <Fragment>{children}</Fragment>;
};

export default PqLayout;
