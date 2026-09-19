import React from 'react'
import type { User, Role, UserStatus } from '@/types/user.types'
import s from './UserTable.module.css'
import avatarPlaceholder from '@/assets/avatar-placeholder.png'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Skeleton from '@/components/effect/Skeleton'

const roleDisplayNames: Record<Role, string> = {
    student: 'Học sinh',
    teacher: 'Giáo viên',
    ta: 'Trợ giảng',
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
    onViewEnrollments?: (user: User) => void
    onViewFinance?: (user: User) => void
    users: User[]
    isLoading?: boolean
}

export const UserTable: React.FC<UserTableProps> = ({
    onEditUser,
    onDeleteUser,
    onLockUser,
    onViewEnrollments,
    onViewFinance,
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
                        const isStudent = user.role === 'student'
                        const isTeacher = user.role === 'teacher'
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
                                        {isStudent && onViewEnrollments && (
                                            <ButtonPrimary
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                onClick={() =>
                                                    onViewEnrollments(user)
                                                }
                                                title="Quản lý lớp học"
                                                style={{
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                                </svg>
                                            </ButtonPrimary>
                                        )}
                                        {isTeacher && onViewFinance && (
                                            <ButtonPrimary
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                onClick={() =>
                                                    onViewFinance(user)
                                                }
                                                title="Cấu hình & Lịch sử lương"
                                                style={{
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                    />
                                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                                    <path d="M12 18V6" />
                                                </svg>
                                            </ButtonPrimary>
                                        )}
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
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20 12V21C20 21.55 19.55 22 19 22H3C2.45 22 2 21.55 2 21V5C2 4.45 2.45 4 3 4H12" />
                                                <path d="M19.15 2.38L9.24 12.29L8 16L11.71 14.76L21.62 4.85C22.07 4.4 22.13 3.71 21.74 3.32L20.68 2.26C20.29 1.87 19.6 1.92 19.15 2.38Z" />
                                            </svg>
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
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M19.07 19.07L4.93 4.93" />
                                                <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" />
                                            </svg>
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
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16.13 22H7.87C7.37 22 6.95 21.63 6.88 21.14L5 8H19L17.12 21.14C17.05 21.63 16.63 22 16.13 22Z" />
                                                <path d="M3.5 8H20.5" />
                                                <path d="M10 12V18" />
                                                <path d="M14 12V18" />
                                                <path d="M16 5H8L9.7 2.45C9.89 2.17 10.2 2 10.54 2H13.47C13.8 2 14.12 2.17 14.3 2.45L16 5Z" />
                                                <path d="M3 5H21" />
                                            </svg>
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
