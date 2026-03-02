import React, { useState } from 'react'
import s from './UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { Button } from '@/components/core/Button'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'
import InputField from '@/components/common/input/InputField'
import { ALL_ROLES } from '@/types/auth'
import { UserFormModal } from './UserFormModal'
import { UserTable } from './UserTable'
import { usePermissions } from '@/hooks/usePermissions'
import { SelectField } from '@/components/common/input/SelectField'
import { useDialog } from '@/hooks/useDialog'
import type { User, Role } from '@/types/user.types'
import Pagination from '@/components/common/menu/Pagination'

// Imports Hooks
import { useUsers, useDeleteUser } from '@/hooks/domain/useUsers'
import { useTableParams } from '@/hooks/useTableParams'
import { useQueryClient } from '@tanstack/react-query'

export const UserManagementPage: React.FC = () => {
    // 1. Setup UI State (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const { alert: showAlert, confirm: showConfirm } = useDialog()
    const { canAny } = usePermissions()
    const canCreateUser = canAny(['user:create:student', 'user:create:teacher'])
    const queryClient = useQueryClient()

    // 2. Setup Table Logic (Search, Sort, Filter, Pagination)
    const {
        page,
        search,
        filters,
        sort,
        setPage,
        setSearch,
        setFilters,
        setSort,
        apiParams,
    } = useTableParams<{ role: Role | '' }>({ role: '' })

    // 3. Data Fetching Hook
    const {
        data: usersPage,
        isLoading,
        isFetching,
    } = useUsers({
        ...apiParams,
        role: apiParams.role || undefined,
    })

    // 4. Mutation Hook (Delete)
    const { mutateAsync: deleteUserMutate } = useDeleteUser()

    // --- Handlers ---

    const handleOpenCreateModal = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleUserSaved = () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        handleCloseModal()
    }

    const handleDeleteUser = async (user: User) => {
        if (!user?.id) return

        const confirmed = await showConfirm(`Xóa người dùng ${user.email}?`)

        if (confirmed) {
            try {
                await deleteUserMutate(user.id)
                showAlert('Đã xóa người dùng thành công', 'Thành công')
            } catch (err: any) {
                showAlert(`Không thể xóa: ${err.message}`, 'Lỗi')
            }
        }
    }

    const handleLockUser = async (user: User) => {
        if (
            await showConfirm(
                `Bạn có chắc chắn muốn ${user.status === 'suspended' ? 'mở khóa' : 'khóa'} tài khoản ${user.firstName}?`
            )
        ) {
            console.log('Toggling lock for user:', user.id)
            showAlert('Chức năng này chưa được triển khai.', 'Thông báo')
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý người dùng</h1>

                {/* FILTER CARD */}
                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>
                    <div className={s.filterControls}>
                        {/* Filter by Role */}
                        <SelectField
                            id="roleFilter"
                            label="Vai trò"
                            registration={{ name: 'roleFilter' as any }}
                            value={filters.role}
                            onChange={(e) =>
                                setFilters({
                                    role: (e.target as HTMLSelectElement)
                                        .value as Role | '',
                                })
                            }
                            options={[
                                { label: 'Tất cả vai trò', value: '' as any },
                                ...ALL_ROLES.map((r) => ({
                                    label: getRoleLabel(r),
                                    value: r,
                                })),
                            ]}
                        />

                        {/* Sort By Field */}
                        <SelectField
                            id="sortBy"
                            label="Sắp xếp"
                            registration={{ name: 'sortBy' as any }}
                            value={sort.field}
                            onChange={(e) =>
                                setSort({
                                    ...sort,
                                    field: (e.target as HTMLSelectElement)
                                        .value,
                                })
                            }
                            options={[
                                { label: 'Ngày tạo', value: 'createdAt' },
                                { label: 'Tên', value: 'firstName' },
                                { label: 'Email', value: 'email' },
                                { label: 'Vai trò', value: 'role' },
                                { label: 'Trạng thái', value: 'status' },
                            ]}
                        />

                        {/* Sort Order */}
                        <SelectField
                            id="sortOrder"
                            label="Thứ tự"
                            registration={{ name: 'sortOrder' as any }}
                            value={sort.order}
                            onChange={(e) =>
                                setSort({
                                    ...sort,
                                    order: (e.target as HTMLSelectElement)
                                        .value as 'asc' | 'desc',
                                })
                            }
                            options={[
                                { label: 'Giảm dần', value: 'desc' },
                                { label: 'Tăng dần', value: 'asc' },
                            ]}
                        />
                    </div>

                    {canCreateUser && (
                        <Button
                            variant="primary"
                            onClick={handleOpenCreateModal}
                        >
                            <img
                                src={IconPlus}
                                alt=""
                                className={s.buttonIcon}
                            />
                            Tạo Người dùng
                        </Button>
                    )}
                </Card>

                {/* TABLE CARD */}
                <Card className={s.tableCard} variant="outline">
                    <UserTable
                        users={usersPage?.users || []}
                        isLoading={isLoading || isFetching}
                        onEditUser={handleOpenEditModal}
                        onDeleteUser={handleDeleteUser}
                        onLockUser={handleLockUser}
                    />
                    <div className={s.paginationWrapper}>
                        <Pagination
                            currentPage={page}
                            totalPages={usersPage?.pages || 0}
                            onPageChange={setPage}
                        />
                    </div>
                </Card>
            </main>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingUser={editingUser}
                onSuccess={handleUserSaved}
            />
        </div>
    )
}

function getRoleLabel(r: string) {
    const map: Record<string, string> = {
        student: 'Học sinh',
        teacher: 'Giáo viên',
        office_admin: 'Quản trị viên Văn phòng',
        center_admin: 'Quản trị viên Trung tâm',
        system_admin: 'Quản trị viên Hệ thống',
    }
    return map[r] || r
}
