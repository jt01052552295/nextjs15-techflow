import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  analytics: ReactNode;
  filter: ReactNode;
  cards: ReactNode;
  charts: ReactNode;
  tables: ReactNode;
};

const MainLayout = ({ children, filter, cards, charts, tables }: Props) => {
  return (
    <div data-layout="main">
      {children}
      {filter}
      {cards}
      {charts}
      {tables}
    </div>
  );
};

export default MainLayout;
