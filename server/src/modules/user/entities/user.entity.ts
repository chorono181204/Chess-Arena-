import { User } from '@prisma/client';

export default class UserEntity implements User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  password: string;
  avatar: string | null;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
