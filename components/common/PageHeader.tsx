'use client';
import useMount from '@/hooks/useMount';
import type { RouteMetadata } from '@/types/routes';

type Props = {
  meta: RouteMetadata;
};

const PageHeader = ({ meta }: Props) => {
  const mount = useMount();

  if (!mount || !meta) return null;

  return (
    <div className="col-md-6">
      <h4 className="h4 mb-1">{meta.name}</h4>
      {meta.desc && <p className="text-body-secondary h6">{meta.desc}</p>}
    </div>
  );
};

export default PageHeader;
