'use client';

import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import type { IUser } from '@/types/user';
// import { maskingName, maskingEmail } from '@/lib/util';

interface UserProfileDisplayProps {
  user?: IUser | null;
  size?: number;
  showEmail?: boolean;
  showName?: boolean;
  className?: string;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  user,
  size = 50,
  showEmail = true,
  showName = true,
  className = '',
}) => {
  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';
  const profile = user?.profile?.[0];
  const profileImageUrl = profile?.url ? `${staticUrl}${profile.url}` : null;

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      {profileImageUrl ? (
        <Image
          src={profileImageUrl}
          alt={user?.name || ''}
          width={size}
          height={size}
          className="rounded-circle border"
        />
      ) : (
        <div
          className="rounded-circle bg-light text-center d-flex align-items-center justify-content-center"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <FontAwesomeIcon icon={faUser} className="text-secondary" />
        </div>
      )}
      {(showName || showEmail) && (
        <div className="d-flex flex-column align-items-start gap-1">
          {showName && <span className="fw-semibold">{user?.name ?? ''}</span>}
          {showEmail && (
            <small className="text-muted">{user?.email ?? ''}</small>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileDisplay;
