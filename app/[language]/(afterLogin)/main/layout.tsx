import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  analytics: ReactNode;
  team: ReactNode;
  overview01: ReactNode;
  overview02: ReactNode;
  overview03: ReactNode;
  overview04: ReactNode;
};

const MainLayout = ({ children, analytics, team }: Props) => {
  return (
    <div data-layout="main">
      {children}
      {analytics}
      {team}
    </div>
  );
};

export default MainLayout;
