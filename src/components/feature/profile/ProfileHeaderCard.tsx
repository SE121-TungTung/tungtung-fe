// src/components/feature/profile/ProfileHeaderCard.tsx
import React from 'react'
import s from './ProfileHeaderCard.module.css'
import Card from '@/components/common/card/Card'
import AvatarImg from '@/assets/avatar-placeholder.png'

// Icon
import EmailIcon from '@/assets/Mail.svg'
import RoleIcon from '@/assets/User Circle.svg'
import JoinIcon from '@/assets/Calendar.svg'
import PhoneIcon from '@/assets/Contact Phone Mail.svg'

interface ProfileHeaderCardProps {
    user: any
}

// Helper format vai trò
const formatRole = (role: string) => {
    const roles: Record<string, string> = {
        student: 'Học sinh',
        teacher: 'Giáo viên',
        office_admin: 'Quản trị viên (Văn phòng)',
        center_admin: 'Quản trị viên (Trung tâm)',
        system_admin: 'Quản trị viên (Hệ thống)',
    }
    return roles[role] || role
}

// Helper format ngày
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    } catch (e) {
        return 'N/A'
    }
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
    user,
}) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`

    return (
        <Card variant="flat" mode="light" className={s.card}>
            <div className={s.header}>
                <img
                    src={user.avatar_url || AvatarImg}
                    alt="Avatar"
                    className={s.avatar}
                />
                <h2 className={s.name}>{fullName}</h2>
                <p className={s.email}>{user.email}</p>
            </div>

            <ul className={s.infoList}>
                <li className={s.infoItem}>
                    <img src={RoleIcon} alt="Role" />
                    <span>Vai trò:</span>
                    <strong>{formatRole(user.role)}</strong>
                </li>
                <li className={s.infoItem}>
                    <img src={JoinIcon} alt="Join date" />
                    <span>Ngày tham gia:</span>
                    <strong>{formatDate(user.created_at)}</strong>
                </li>
                <li className={s.infoItem}>
                    <img src={PhoneIcon} alt="Phone" />
                    <span>Điện thoại:</span>
                    <strong>{user.phone || 'Chưa cập nhật'}</strong>
                </li>
                <li className={s.infoItem}>
                    <img src={EmailIcon} alt="Email" />
                    <span>Ngày sinh:</span>
                    <strong>
                        {user.date_of_birth
                            ? formatDate(user.date_of_birth)
                            : 'Chưa cập nhật'}
                    </strong>
                </li>
            </ul>
        </Card>
    )
}
