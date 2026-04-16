export const ROLES = [
  "FOUNDATION_ADMIN",
  "SCHOOL_ADMIN",
  "TEACHER",
  "STUDENT",
  "COMMUNITY_MEMBER",
] as const;

export type UserRole = (typeof ROLES)[number];

export function isUserRole(v: string): v is UserRole {
  return (ROLES as readonly string[]).includes(v);
}
