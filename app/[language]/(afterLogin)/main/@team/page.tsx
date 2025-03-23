import { wait } from '@/lib/wait';
import Example1 from '@/components/main/analytics/Example1';

const AnalyticsPage = async () => {
  await wait(3000);
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6 mb-3">
          <Example1 />
        </div>
        <div className="col-md-6 mb-3">
          <Example1 />
        </div>
        <div className="col-md-6 mb-3">
          <Example1 />
        </div>
        <div className="col-md-6 mb-3">
          <Example1 />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
