import { wait } from '@/lib/wait';
import Period from '@/components/main/filter/Period';

const Page = async () => {
  await wait(1000);
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12 mb-3">
          <Period />
        </div>
      </div>
    </div>
  );
};

export default Page;
