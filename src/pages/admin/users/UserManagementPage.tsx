import React, { useMemo, useState } from 'react'
import s from './UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { Button } from '@/components/core/Button'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'
import InputField from '@/components/common/input/InputField'
import { ALL_ROLES, type Role, type User } from '@/types/auth'
import { UserFormModal } from './UserFormModal'
import { UserTable } from './UserTable'
import { usePermissions } from '@/hooks/usePermissions'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { deleteUser, listUsers } from '@/lib/users'
import { SelectField } from '@/components/common/input/SelectField'

type SortBy = 'name' | 'email' | 'role' | 'status' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const UserManagementPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const [searchValue, setSearchValue] = useState('')
    const [roleFilter, setRoleFilter] = useState<Role | ''>('')
    const [sortBy, setSortBy] = useState<SortBy>('createdAt')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    const { data: usersPage, isLoading } = useQuery({
        queryKey: [
            'users',
            {
                role: roleFilter || undefined,
                search: searchValue,
                skip: 0,
                limit: 100,
                include_deleted: false,
            },
        ],
        queryFn: () =>
            listUsers({
                role: roleFilter || undefined,
                search: searchValue,
                skip: 0,
                limit: 100,
                include_deleted: false,
            }),
        placeholderData: keepPreviousData,
    })
    const users = useMemo(() => {
        const usersRaw = usersPage?.items ?? []
        const arr = [...usersRaw]
        const dir = sortOrder === 'asc' ? 1 : -1
        const get = (u: User) => {
            switch (sortBy) {
                case 'name':
                    return `${u.firstName} ${u.lastName}`.toLowerCase()
                case 'email':
                    return u.email.toLowerCase()
                case 'role':
                    return u.role
                case 'status':
                    return u.status
                case 'createdAt':
                default:
                    return u.createdAt
            }
        }
        arr.sort((a, b) => {
            const va = get(a),
                vb = get(b)
            if (va === vb) return 0
            return va > vb ? dir : -dir
        })
        return arr
    }, [usersPage, sortBy, sortOrder])

    const queryClient = useQueryClient()

    const { mutateAsync: deleteUserMutateAsync } = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onMutate: async (userId) => {
            await queryClient.cancelQueries({ queryKey: ['users'] })

            const previousUsers = queryClient.getQueryData(['users'])

            queryClient.setQueryData(['users'], (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    items: old.items.filter((u: User) => u.id !== userId),
                    total: old.total - 1,
                }
            })

            return { previousUsers }
        },
        onError: (err, userId, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers)
            }
            console.error('Delete user ', userId, 'with error:', err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })

    const { canAny } = usePermissions()
    const canCreateUser = canAny(['user:create:student', 'user:create:teacher'])

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

    const handleDeleteUser = (user: User) => {
        if (!user?.id) return
        const ok = window.confirm(`Xóa người dùng ${user.email}?`)
        if (ok) {
            deleteUserMutateAsync(user.id).catch((err) => {
                window.alert(
                    `Không thể xóa người dùng ${user.email}: ${err.message}`
                )
            })
        }
    }

    const handleLockUser = (user: User) => {
        // TODO: Tích hợp API
        if (
            window.confirm(
                `Bạn có chắc chắn muốn ${user.status === 'suspended' ? 'mở khóa' : 'khóa'} tài khoản ${user.firstName} ${user.lastName}?`
            )
        ) {
            console.log('Toggling lock for user:', user.id)
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý người dùng</h1>

                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên hoặc email..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>
                    <div className={s.filterControls}>
                        <SelectField
                            id="roleFilter"
                            label="Vai trò"
                            registration={{ name: 'roleFilter' as any }}
                            value={roleFilter}
                            onChange={(e) =>
                                setRoleFilter(
                                    (e.target as HTMLSelectElement).value as
                                        | Role
                                        | ''
                                )
                            }
                            options={[
                                { label: 'Tất cả vai trò', value: '' as any },
                                ...ALL_ROLES.map((r) => ({
                                    label:
                                        r === 'student'
                                            ? 'Học sinh'
                                            : r === 'teacher'
                                              ? 'Giáo viên'
                                              : r === 'office_admin'
                                                ? 'Quản trị viên Văn phòng'
                                                : r === 'center_admin'
                                                  ? 'Quản trị viên Trung tâm'
                                                  : 'Quản trị viên Hệ thống',
                                    value: r,
                                })),
                            ]}
                        />

                        <SelectField
                            id="sortBy"
                            label="Sắp xếp"
                            registration={{ name: 'sortBy' as any }}
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    (e.target as HTMLSelectElement)
                                        .value as SortBy
                                )
                            }
                            options={[
                                {
                                    label: 'Sắp theo ngày tạo',
                                    value: 'createdAt',
                                },
                                { label: 'Sắp theo tên', value: 'name' },
                                { label: 'Sắp theo email', value: 'email' },
                                { label: 'Sắp theo vai trò', value: 'role' },
                                {
                                    label: 'Sắp theo trạng thái',
                                    value: 'status',
                                },
                            ]}
                        />

                        <SelectField
                            id="sortOrder"
                            label="Thứ tự"
                            registration={{ name: 'sortOrder' as any }}
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(
                                    (e.target as HTMLSelectElement)
                                        .value as SortOrder
                                )
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

                <Card
                    className={s.tableCard}
                    variant="outline"
                    controls={<div></div>}
                >
                    {' '}
                    <UserTable
                        users={users}
                        isLoading={isLoading}
                        onEditUser={handleOpenEditModal}
                        onDeleteUser={handleDeleteUser}
                        onLockUser={handleLockUser}
                    />
                    {/* TODO: Thêm Pagination component ở đây */}
                </Card>
            </main>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingUser={editingUser}
            />
        </div>
    )
}
