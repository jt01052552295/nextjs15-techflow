import { UserRole } from '@prisma/client';

export interface IUser {
  idx: number;
  id: string;
  email: string;
  emailVerified?: Date | null;
  phone: string;
  password: string;
  name: string;
  nick: string;
  level: number;
  zipcode?: string | null;
  addr1?: string | null;
  addr2?: string | null;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  signUpVerified?: Date | null;
  isUse: boolean;
  isVisible: boolean;
  isSignout: boolean;
  profile?: IUserProfile[] | null;
  accounts?: IUserAccountPart[] | null;
}
export type IUserPart = Partial<IUser>;

export interface IUserProfile {
  idx?: number;
  uid: string;
  userId: string;
  name: string;
  url: string;
  user?: IUser | null; // (선택적 관계)
}
export type IUserProfilePart = Partial<IUserProfile>;

export interface IUserAccount {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export type IUserAccountPart = Partial<IUserAccount>;
