export const USER_ROLES = ["ADMIN", "ANALISTA"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  document?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser({ passwordHash: _passwordHash, ...user }: User): PublicUser {
  return user;
}
