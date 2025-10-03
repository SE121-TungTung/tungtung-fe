import type { Role } from '@/types/auth'

export const homePathByRole = (r: Role) =>
    r === 'student'
        ? '/student'
        : r === 'teacher'
          ? '/teacher'
          : r === 'office_admin'
            ? '/office'
            : r === 'center_admin'
              ? '/center'
              : '/admin'
