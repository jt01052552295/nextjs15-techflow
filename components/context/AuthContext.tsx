'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

import { logoutAndRedirectAction } from '@/actions/auth/logout';

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  // 필요한 다른 사용자 속성 추가
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  //const { locale } = useLanguage();

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      // const timestamp = new Date().getTime();
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        setUser(userData.user);
        return userData.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 및 경로 변경 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUser();

    // 경로 변경 이벤트 리스너 추가
    const handleRouteChange = () => {
      console.log('Route changed, refreshing user data');
      fetchUser();
    };

    // 경로 변경 이벤트 구독
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // 로그인 함수
  const login = (token: string, userData: User) => {
    setUser(userData);
    // 필요한 경우 토큰을 로컬 스토리지나 쿠키에 저장
    // localStorage.setItem('auth_token', token);
    // 로그인 후 라우터 새로고침
    router.refresh();
  };

  // 로그아웃 함수
  const logout = async () => {
    setUser(null);
    await logoutAndRedirectAction();
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    return await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
