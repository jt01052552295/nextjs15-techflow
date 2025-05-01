import { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function PolicyLayout({ children }: Props) {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">{children}</div>
      </div>
    </div>
  );
}
