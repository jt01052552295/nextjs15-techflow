'use client';
import { useAuth } from '@/components/context/AuthContext';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import SessionCountdown from '@/components/auth/SessionCountdown';

interface UserProfileWidgetProps {
  collapse: boolean;
}

const UserProfileWidget = ({ collapse }: UserProfileWidgetProps) => {
  const { user } = useAuth();
  const staticUrl = process.env.NEXT_PUBLIC_HTTP_STATIC_URL || '';
  
  // 프로필 이미지 URL 가져오기 (첫 번째 프로필만 사용)
  const profileImageUrl =
    user?.profile && user.profile.length > 0
      ? staticUrl + user.profile[0].url
      : null;

  if (!user) return null;

  return (
    <div className="user-profile p-3 border-bottom">
      <div className="d-flex align-items-center">
        <div className="profile-avatar me-3">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={user.name || '사용자'}
              width={50}
              height={50}
              className="rounded-circle border"
            />
          ) : (
            <div
              className="avatar-placeholder rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
              style={{ width: 50, height: 50 }}
            >
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}
        </div>
        <div className="profile-info flex-grow-1">
          <div
            className="fw-bold text-truncate"
            style={{ maxWidth: collapse ? '150px' : '100px' }}
          >
            {user.name || '-'}
          </div>
          <div className="session-timer small text-muted">
            <SessionCountdown />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileWidget;