// src/components/feature/profile/ProfileEditor.tsx
import React from 'react'
import s from './ProfileEditor.module.css'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField' // Dùng InputField
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary' // Dùng ButtonPrimary

interface ProfileEditorProps {
    user: any // Kiểu user
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user }) => {
    // TODO: Tích hợp React Hook Form + Zod ở đây

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Logic gọi API cập nhật thông tin
        alert('Đang cập nhật thông tin...')
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Logic gọi API đổi mật khẩu
        alert('Đang đổi mật khẩu...')
    }

    return (
        <div className={s.wrapper}>
            {/* Card 1: Cập nhật thông tin cá nhân (UC006) */}
            <Card title="Thông tin cá nhân" variant="flat" mode="light">
                <form onSubmit={handleInfoSubmit} className={s.formGrid}>
                    <InputField
                        label="Họ"
                        defaultValue={user.last_name || ''}
                        variant="soft"
                        mode="light"
                        className={s.gridItem} // Cho 2 cột
                    />
                    <InputField
                        label="Tên"
                        defaultValue={user.first_name || ''}
                        variant="soft"
                        mode="light"
                        className={s.gridItem} // Cho 2 cột
                    />
                    <InputField
                        label="Email"
                        defaultValue={user.email || ''}
                        variant="soft"
                        mode="light"
                        disabled // Không cho sửa email
                        className={s.fullWidth} // 1 cột
                    />
                    <InputField
                        label="Số điện thoại"
                        defaultValue={user.phone || ''}
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                    />
                    <InputField
                        label="Ngày sinh"
                        type="date"
                        defaultValue={
                            user.date_of_birth
                                ? user.date_of_birth.split('T')[0]
                                : ''
                        }
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                    />
                    <InputField
                        label="Địa chỉ"
                        defaultValue={user.address || ''}
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                    />

                    <div className={`${s.formActions} ${s.fullWidth}`}>
                        <ButtonPrimary type="submit">
                            Lưu thay đổi
                        </ButtonPrimary>
                    </div>
                </form>
            </Card>

            {/* Card 2: Đổi mật khẩu */}
            <Card title="Đổi mật khẩu" variant="flat" mode="light">
                <form onSubmit={handlePasswordSubmit} className={s.formGrid}>
                    <InputField
                        label="Mật khẩu cũ"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                    />
                    <InputField
                        label="Mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                    />
                    <InputField
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                    />
                    <div className={`${s.formActions} ${s.fullWidth}`}>
                        <ButtonPrimary type="submit">
                            Đổi mật khẩu
                        </ButtonPrimary>
                    </div>
                </form>
            </Card>
        </div>
    )
}
