import { z } from 'zod'
import { ALL_ROLES } from '@/types/auth'

const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/

const FileSchema = typeof File !== 'undefined' ? z.instanceof(File) : z.any()

export const userFormSchema = z.object({
    defaultClassId: z.uuid('ID lớp không hợp lệ').optional().or(z.literal('')),

    id: z.uuid().optional(),
    firstName: z
        .string()
        .min(1, { message: 'Họ không được để trống' })
        .max(100),
    lastName: z
        .string()
        .min(1, { message: 'Tên không được để trống' })
        .max(100),
    email: z
        .email({ message: 'Email không hợp lệ' })
        .min(1, { message: 'Email không được để trống' }),
    phone: z
        .string()
        .regex(phoneRegex, { message: 'Số điện thoại không hợp lệ' })
        .optional()
        .or(z.literal('')),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    avatarFile: FileSchema.nullable().optional(),

    role: z.enum(ALL_ROLES, {
        message: 'Vai trò không hợp lệ',
    }),
})

export type UserFormValues = z.infer<typeof userFormSchema>
