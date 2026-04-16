export const TEACHER_ADMIN_EMAIL = "teacher-admin@niuyang.local";
export const TEACHER_ADMIN_PASSWORD = "TeacherAdmin2026!";

export function isValidStudentId(studentId: string): boolean {
  if (!/^202229013\d{3}$/.test(studentId)) return false;
  const suffix = Number(studentId.slice(-3));
  return suffix >= 0 && suffix <= 100;
}
