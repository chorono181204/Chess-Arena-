import type { User } from '@prisma/client';

export default class UserEntity implements User {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
