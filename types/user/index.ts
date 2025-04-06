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
