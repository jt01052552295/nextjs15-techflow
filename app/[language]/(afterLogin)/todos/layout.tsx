import { Fragment, ReactNode } from 'react';
import type { Metadata } from 'next';

type Props = { children: ReactNode; modal: ReactNode };

export const metadata: Metadata = {
  title: 'Todo',
  description: 'test',
  keywords: ['Todo', '할일', '모음'],
  // title: {
  //     absolute: 'Todo',
  //   },
};

const TodoLayout = ({ children, modal }: Props) => {
  return (
    <Fragment>
      {children}
      {modal}
    </Fragment>
  );
};

export default TodoLayout;
