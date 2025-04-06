'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/context/LanguageContext';
import { useAuth } from '@/components/context/AuthContext';

interface SessionCountdownProps {
  initialExpiresAt?: string;
}

const SessionCountdown: React.FC<SessionCountdownProps> = ({
  initialExpiresAt,
}) => {
  const { dictionary } = useLanguage();
  const { refreshUser } = useAuth();
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    initialExpiresAt ? new Date(initialExpiresAt) : null,
  );
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  // 초기 만료 시간이 없으면 쿠키에서 가져오기
  useEffect(() => {
    if (!initialExpiresAt) {
      const expires = document.cookie
        .split('; ')
        .find((row) => row.startsWith('session_expires='))
        ?.split('=')[1];

      if (expires) {
        try {
          setExpiresAt(new Date(decodeURIComponent(expires)));
        } catch (e) {
          console.error('Invalid date in cookie:', e);
        }
      }
    }
  }, [initialExpiresAt]);

  // 남은 시간 계산
  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAt.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      // 남은 시간이 3일 이하면 연장 버튼 표시
      setShowExtendButton(days <= 3);
      // setShowExtendButton(days > 3);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // 세션 연장 함수
  const extendSession = async () => {
    if (isExtending) return;

    setIsExtending(true);
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setExpiresAt(new Date(data.expiresAt));
        toast.success(dictionary.common.auth.session.extended);
        refreshUser(); // 사용자 정보 새로고침

        // 쿠키 업데이트
        document.cookie = `session_expires=${encodeURIComponent(data.expiresAt)}; path=/; max-age=${30 * 24 * 60 * 60}`;
      } else {
        toast.error(data.error || dictionary.common.unknown_error);
      }
    } catch (error) {
      console.error('세션 연장 오류:', error);
      toast.error(dictionary.common.unknown_error);
    } finally {
      setIsExtending(false);
    }
  };

  if (!expiresAt) return null;

  return (
    <div className="session-countdown">
      <div className="d-flex align-items-center">
        <span className="badge bg-info">
          {timeLeft.days > 0 &&
            `${timeLeft.days}${dictionary.common.auth.session.days} `}
          {timeLeft.hours.toString().padStart(2, '0')}:
          {timeLeft.minutes.toString().padStart(2, '0')}:
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>

        {showExtendButton ? (
          <button
            className="btn badge bg-info ms-2 "
            onClick={extendSession}
            disabled={isExtending}
          >
            {isExtending
              ? dictionary.common.loading
              : dictionary.common.auth.session.extend}
          </button>
        ) : (
          <small className="text-muted ms-2">
            {dictionary.common.auth.session.expiresIn}
          </small>
        )}
      </div>
    </div>
  );
};

export default SessionCountdown;
