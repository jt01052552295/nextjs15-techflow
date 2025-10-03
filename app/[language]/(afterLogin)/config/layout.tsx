import { Fragment, ReactNode } from 'react';
import type { Metadata } from 'next';

type Props = { children: ReactNode; modal: ReactNode };

export const metadata: Metadata = {
  title: 'Config',
  description: 'Config',
  keywords: ['Config', 'Config'],
  // title: {
  //     absolute: 'Todo',
  //   },
};

const PqLayout = ({ children, modal }: Props) => {
  return (
    <Fragment>
      {children}
      {modal}
    </Fragment>
  );
};

export default PqLayout;
