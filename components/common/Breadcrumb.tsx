'use client';
import React from 'react';
import Link from 'next/link';
import useMount from '@/hooks/useMount';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

type BreadcrumbPath = {
  name: string;
  url: string;
};

type BreadcrumbProps = {
  paths: BreadcrumbPath[]; // 경로 배열
};

const Breadcrumb = ({ paths }: BreadcrumbProps) => {
  const mount = useMount();
  const displayPaths = paths.slice(0, 3);

  if (!mount) return null;

  return (
    <div className="col-md-6">
      <nav className="d-md-flex justify-content-md-end" aria-label="breadcrumb">
        <ol className="breadcrumb m-0">
          {displayPaths.map((path, index) => {
            const isLast = index === displayPaths.length - 1;

            return (
              <li
                key={index}
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {isLast ? (
                  <span>{path.name}</span>
                ) : (
                  <Link
                    href={path.url}
                    className="link-secondary link-underline link-underline-opacity-0"
                  >
                    {index === 0 && (
                      <FontAwesomeIcon icon={faHouse} className="me-1" />
                    )}
                    {path.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
