import { useMemo, useState } from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import ClassTable from './ClassTable'
import { ClassFormModal } from './ClassFormModal'
import {
    listClasses,
    deleteClass,
    type Class,
    type ClassStatus,
} from '@/lib/classes'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Card from '@/components/common/card/Card'
import s from './ClassManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'
import { usePermissions } from '@/hooks/usePermissions'

import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import { type Role as UserRole } from '@/types/auth'

type SortBy = 'name' | 'startDate' | 'createdAt' | 'maxStudents'
type SortOrder = 'asc' | 'desc'

const CLASS_STATUS_OPTIONS: { label: string; value: ClassStatus | '' }[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã lên lịch', value: 'scheduled' },
    { label: 'Đang diễn ra', value: 'active' },
    { label: 'Đã hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
    { label: 'Dời ngày', value: 'postponed' },
]

const SORT_BY_OPTIONS = [
    { label: 'Sắp theo ngày tạo', value: 'createdAt' },
    { label: 'Sắp theo tên', value: 'name' },
    { label: 'Sắp theo ngày bắt đầu', value: 'startDate' },
    { label: 'Sắp theo sĩ số', value: 'maxStudents' },
]

const SORT_ORDER_OPTIONS = [
    { label: 'Giảm dần', value: 'desc' },
    { label: 'Tăng dần', value: 'asc' },
]

export default function ClassManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const canCreateClass = can('class:create')

    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<Class | null>(null)

    // State cho Filters
    const [searchValue, setSearchValue] = useState('')
    const [status, setStatus] = useState<ClassStatus | ''>('')
    const [page, setPage] = useState(1)
    const [limit] = useState(10)

    // State cho Sorting
    const [sortBy, setSortBy] = useState<SortBy>('createdAt')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    // Navigation/Header (giữ nguyên)
    const navigate = useNavigate()
    const session = useSession((state) => state.user)
    const location = useLocation()
    const userRole = (session?.role as UserRole) || 'student'
    const currentPath = location.pathname
    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    // Query (Sử dụng client-side sorting)
    const queryKey = useMemo(
        () => [
            'classes',
            {
                search: searchValue,
                status: status || undefined,
                page,
                limit,
            },
        ],
        [searchValue, status, page, limit]
    )

    const classesQuery = useQuery({
        queryKey,
        queryFn: () =>
            listClasses({
                search: searchValue,
                status: status || '',
                page,
                limit,
            }),
        placeholderData: keepPreviousData,
    })

    // Client-side Sorting
    const classes = useMemo(() => {
        const classesRaw = classesQuery.data?.items ?? []
        const arr = [...classesRaw]
        const dir = sortOrder === 'asc' ? 1 : -1
        const get = (c: Class) => {
            switch (sortBy) {
                case 'name':
                    return c.name.toLowerCase()
                case 'startDate':
                    return c.startDate
                case 'maxStudents':
                    return c.maxStudents
                case 'createdAt':
                default:
                    return c.createdAt
            }
        }
        arr.sort((a, b) => {
            const va = get(a),
                vb = get(b)
            if (va === vb) return 0
            return va > vb ? dir : -dir
        })
        return arr
    }, [classesQuery.data, sortBy, sortOrder])

    // Mutation
    const { mutate: doDelete } = useMutation({
        mutationFn: async (classItem: Class) => {
            if (!window.confirm(`Xóa lớp học "${classItem.name}"?`)) return
            await deleteClass(classItem.id)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['classes'] })
        },
        onError: (err) => {
            window.alert(`Không thể xóa lớp học: ${err.message}`)
        },
    })

    // Modal Handlers
    const handleOpenCreateModal = () => {
        setEditingClass(null)
        setIsModalOpen(true)
    }
    const handleOpenEditModal = (c: Class) => {
        setEditingClass(c)
        setIsModalOpen(true)
    }
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingClass(null)
    }

    const data = classesQuery.data

    return (
        <div className={s.pageWrapper}>
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={session?.avatarUrl || DefaultAvatar}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Lớp học</h1>

                {/* Filter Card */}
                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên lớp..."
                            value={searchValue}
                            onChange={(e: any) =>
                                setSearchValue(e.target.value)
                            }
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>
                    <div className={s.filterControls}>
                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={status}
                            options={CLASS_STATUS_OPTIONS}
                            onChange={(e: any) => setStatus(e.target.value)}
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
                            options={SORT_BY_OPTIONS}
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
                            options={SORT_ORDER_OPTIONS}
                        />
                    </div>

                    {canCreateClass && (
                        <Button
                            variant="primary"
                            onClick={handleOpenCreateModal}
                        >
                            <img
                                src={IconPlus}
                                alt=""
                                className={s.buttonIcon}
                            />
                            Tạo lớp học
                        </Button>
                    )}
                </Card>

                {/* Table Card */}
                <Card className={s.tableCard} variant="outline">
                    <ClassTable
                        classes={classes} // Truyền mảng đã sort
                        onEditClass={handleOpenEditModal}
                        onDeleteClass={(c) => doDelete(c)}
                        isLoading={classesQuery.isLoading}
                    />
                </Card>

                {/* Pagination */}
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-16) var(--space-8)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Tổng: {data?.total ?? 0} — Trang {data?.page ?? page}/
                        {data?.pages ?? 1}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={
                                (data?.page ?? 1) <= 1 ||
                                classesQuery.isFetching
                            }
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            ← Trước
                        </ButtonPrimary>
                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={
                                (data?.page ?? 1) >= (data?.pages ?? 1) ||
                                classesQuery.isFetching
                            }
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau →
                        </ButtonPrimary>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <ClassFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editing={editingClass}
                onSaved={() => {
                    qc.invalidateQueries({ queryKey: ['classes'] })
                }}
            />
        </div>
    )
}
