import { z } from 'zod'
export const loginSchema = z.object({
    email: z.email('Email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Mật khẩu tối thiểu 8 ký tự')
        .regex(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
            'Mật khẩu phải có ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
        ),
    remember: z.boolean().optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
