import { Fragment, ReactNode } from 'react';

type Props = { children: ReactNode; modal: ReactNode };

const PqLayout = ({ children, modal }: Props) => {
  return (
    <Fragment>
      {children}
      {modal}
    </Fragment>
  );
};

export default PqLayout;
