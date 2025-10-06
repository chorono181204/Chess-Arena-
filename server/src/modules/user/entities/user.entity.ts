import { User } from '@prisma/client';

export default class UserEntity implements User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
