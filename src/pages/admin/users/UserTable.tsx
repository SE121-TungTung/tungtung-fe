import React from 'react'
import type { User, Role, UserStatus } from '@/types/user.types'
import s from './UserTable.module.css'
import avatarPlaceholder from '@/assets/avatar-placeholder.png'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'

import IconEdit from '@/assets/Edit Pen.svg'
import IconDelete from '@/assets/Trash Bin.svg'
import IconLock from '@/assets/Block.svg'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Skeleton from '@/components/effect/Skeleton'

const roleDisplayNames: Record<Role, string> = {
    student: 'Học sinh',
    teacher: 'Giáo viên',
    office_admin: 'Admin Văn phòng',
    center_admin: 'Admin Trung tâm',
    system_admin: 'Admin Hệ thống',
}

const userStatusMap: Record<
    UserStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    active: { label: 'Hoạt động', variant: 'success' },
    inactive: { label: 'Không hoạt động', variant: 'neutral' },
    suspended: { label: 'Đã khóa', variant: 'danger' },
    pending_activation: { label: 'Chờ kích hoạt', variant: 'warning' },
}

const getUserStatusProps = (status: UserStatus) => {
    return userStatusMap[status] || userStatusMap.inactive
}

interface UserTableProps {
    onEditUser: (user: User) => void
    onDeleteUser: (user: User) => void
    onLockUser: (user: User) => void
    users: User[]
    isLoading?: boolean
}

export const UserTable: React.FC<UserTableProps> = ({
    onEditUser,
    onDeleteUser,
    onLockUser,
    users,
    isLoading,
}) => {
    const { can, role: currentUserRole } = usePermissions()

    const canActOnUser = (targetUser: User): boolean => {
        if (targetUser.role === 'system_admin') {
            return currentUserRole === 'system_admin'
        }
        if (targetUser.role === 'center_admin') {
            return currentUserRole === 'system_admin'
        }
        if (targetUser.role === 'office_admin') {
            return (
                currentUserRole === 'system_admin' ||
                currentUserRole === 'center_admin'
            )
        }
        return true
    }

    const UserRowSkeleton = () => (
        <tr>
            {/* Cột 1: Avatar + Tên */}
            <td>
                <div className={s.userCell}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <div className={s.userInfo}>
                        <Skeleton
                            width={120}
                            height={16}
                            style={{ marginBottom: 4 }}
                        />
                        <Skeleton width={160} height={14} />
                    </div>
                </div>
            </td>
            {/* Cột 2: Liên hệ */}
            <td>
                <div className={s.contactCell}>
                    <Skeleton width={100} height={20} />
                </div>
            </td>
            {/* Cột 3: Vai trò */}
            <td>
                <Skeleton width={90} height={20} />
            </td>
            {/* Cột 4: Trạng thái (Badge) */}
            <td>
                <Skeleton
                    width={100}
                    height={24}
                    style={{ borderRadius: 12 }}
                />
            </td>
            {/* Cột 5: Ngày tạo */}
            <td>
                <Skeleton width={80} height={20} />
            </td>
            {/* Cột 6: Hành động (3 nút) */}
            <td>
                <div className={s.actionsCell}>
                    <Skeleton
                        width={32}
                        height={32}
                        style={{ borderRadius: 8 }}
                    />
                    <Skeleton
                        width={32}
                        height={32}
                        style={{ borderRadius: 8 }}
                    />
                    <Skeleton
                        width={32}
                        height={32}
                        style={{ borderRadius: 8 }}
                    />
                </div>
            </td>
        </tr>
    )

    return (
        <table className={s.table}>
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>Liên hệ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th className={s.actionsHeader}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <>
                        {[...Array(10)].map((_, index) => (
                            <UserRowSkeleton key={index} />
                        ))}
                    </>
                ) : users.length === 0 ? (
                    <tr>
                        <td colSpan={6} className={s.loadingCell}>
                            Không có người dùng nào.
                        </td>
                    </tr>
                ) : (
                    users.map((user) => {
                        const statusProps = getUserStatusProps(user.status)
                        const canEdit = can('user:update') && canActOnUser(user)
                        const canLock = can('user:lock') && canActOnUser(user)
                        const canDelete =
                            can('user:delete') && canActOnUser(user)
                        return (
                            <tr key={user.id}>
                                <td>
                                    <div className={s.userCell}>
                                        <img
                                            src={
                                                user.avatarUrl ||
                                                avatarPlaceholder
                                            }
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className={s.avatar}
                                        />
                                        <div className={s.userInfo}>
                                            <span
                                                className={s.userName}
                                            >{`${user.firstName} ${user.lastName}`}</span>
                                            <span className={s.userEmail}>
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={s.contactCell}>
                                        <span>
                                            {user.phone || 'Chưa cập nhật'}
                                        </span>
                                    </div>
                                </td>
                                <td>{roleDisplayNames[user.role]}</td>
                                <td>
                                    <StatusBadge
                                        variant={statusProps.variant}
                                        label={statusProps.label}
                                    />
                                </td>
                                <td>
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString('vi-VN')}
                                </td>
                                <td>
                                    <div className={s.actionsCell}>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onEditUser(user)}
                                            disabled={!canEdit}
                                            title={
                                                canEdit
                                                    ? 'Chỉnh sửa'
                                                    : 'Không có quyền sửa'
                                            }
                                        >
                                            <img src={IconEdit} alt="Sửa" />
                                        </ButtonPrimary>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onLockUser(user)}
                                            disabled={!canLock}
                                            title={
                                                canLock
                                                    ? 'Khóa/Mở khóa'
                                                    : 'Không có quyền khóa'
                                            }
                                        >
                                            <img src={IconLock} alt="Khóa" />
                                        </ButtonPrimary>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onDeleteUser(user)}
                                            disabled={!canDelete}
                                            title={
                                                canDelete
                                                    ? 'Xóa vĩnh viễn'
                                                    : 'Không có quyền xóa'
                                            }
                                            className={s.dangerButton}
                                        >
                                            <img src={IconDelete} alt="Xóa" />
                                        </ButtonPrimary>
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                )}
            </tbody>
        </table>
    )
}
