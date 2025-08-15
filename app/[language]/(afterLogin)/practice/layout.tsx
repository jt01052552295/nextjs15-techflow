import { Fragment, ReactNode } from 'react';
import type { Metadata } from 'next';

type Props = { children: ReactNode; modal: ReactNode };

export const metadata: Metadata = {
  title: '리액트쿼리-연습',
  description: '연습',
  keywords: ['리액트쿼리', '연습'],
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
