import { wait } from '@/lib/wait';
import { Suspense } from 'react';
import ActivityTable from '@/components/main/dashboard/ActivityTable';
import Skeleton from '@/components/main/dashboard/Skeleton';

const Page = async () => {
  await wait(3000);
  return (
    <div className="container-fluid">
      <Suspense fallback={<CardsSkeleton />}>
        <ActivityTable />
      </Suspense>
    </div>
  );
};

const CardsSkeleton = () => {
  return (
    <div className="row">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="col-sm-6 col-md-4 col-xl mb-4">
          <Skeleton />
        </div>
      ))}
    </div>
  );
};

export default Page;
