'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { IUser, IUserProfile } from '@/types/user';
import { logoutAndRedirectAction } from '@/actions/auth/logout';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userProfiles: IUserProfile[]; // 사용자 프로필 이미지 목록
  login: (token: string, user: IUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfiles: (profile: IUserProfile[]) => void; // 프로필 이미지 업데이트 함수 추가
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  userProfiles: [],
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUserProfiles: () => {},
});

// 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [userProfiles, setUserProfiles] = useState<IUserProfile[]>([]);
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

        if (userData.user && userData.user.profile) {
          setUserProfiles(userData.user.profile);
        } else {
          setUserProfiles([]);
        }

        return userData.user;
      } else {
        setUser(null);
        setUserProfiles([]);
        return null;
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      setUser(null);
      setUserProfiles([]);
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
  const login = (token: string, userData: IUser) => {
    setUser(userData);
    // 사용자 프로필 이미지 설정
    if (userData && userData.profile) {
      setUserProfiles(userData.profile);
    } else {
      setUserProfiles([]);
    }
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

  // 프로필 이미지 업데이트 함수
  const updateUserProfiles = (profile: IUserProfile[]) => {
    // 현재 프로필과 새 프로필을 비교하여 변경된 경우에만 업데이트
    const profilesChanged =
      JSON.stringify(profile) !== JSON.stringify(userProfiles);

    if (profilesChanged) {
      setUserProfiles(profile);
      if (user) {
        setUser({
          ...user,
          profile,
        } as IUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        userProfiles,
        login,
        logout,
        refreshUser,
        updateUserProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
