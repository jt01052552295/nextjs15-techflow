import { ReactNode, Suspense } from 'react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import Sidebar from '@/components/common/Sidebar';
import Main from '@/components/main/Main';
import SidebarOverlay from '@/components/common/SidebarOverlay';

type Props = { children: ReactNode; modal: ReactNode };
const AfterLoginLayout = ({ children, modal }: Props) => {
  return (
    <div className="wrapper" data-layout="afterLogin">
      <Suspense fallback={<LoadingSkeleton />}>
        <Sidebar />
        <Main>
          {children}
          {modal}
        </Main>
        <SidebarOverlay />
      </Suspense>
    </div>
  );
};

export default AfterLoginLayout;
