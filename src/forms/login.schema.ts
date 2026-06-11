import { z } from 'zod'
export const loginSchema = z.object({
    email: z.email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    remember: z.boolean().optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
