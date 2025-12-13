import { useEffect, useMemo, useState } from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import CourseTable from './CourseTable'
import { CourseFormModal } from './CourseFormModal'
import {
    listCourses,
    deleteCourse,
    type Course,
    type CourseStatus,
    type CourseLevel,
} from '@/lib/courses'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Card from '@/components/common/card/Card'
import s from './CourseManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'
import { usePermissions } from '@/hooks/usePermissions'

import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import { type Role as UserRole } from '@/types/auth'

type SortBy = 'name' | 'fee_amount' | 'created_at' | 'duration_hours'
type SortOrder = 'asc' | 'desc'

const COURSE_LEVEL_OPTIONS = [
    { label: 'Tất cả cấp độ', value: '' },
    { label: 'Mất gốc', value: 'beginner' },
    { label: 'Cơ bản', value: 'elementary' },
    { label: 'Trung cấp', value: 'intermediate' },
    { label: 'Trung cấp+', value: 'upper_intermediate' },
    { label: 'Cao cấp', value: 'advanced' },
    { label: 'Chuyên gia', value: 'proficiency' },
]

const COURSE_STATUS_OPTIONS = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' },
    { label: 'Lưu trữ', value: 'archived' },
]

const SORT_BY_OPTIONS = [
    { label: 'Sắp theo ngày tạo', value: 'createdAt' },
    { label: 'Sắp theo tên', value: 'name' },
    { label: 'Sắp theo học phí', value: 'feeAmount' },
    { label: 'Sắp theo thời lượng', value: 'durationHours' },
]

const SORT_ORDER_OPTIONS = [
    { label: 'Giảm dần', value: 'desc' },
    { label: 'Tăng dần', value: 'asc' },
]

export default function CourseManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const canCreateCourse = can('course:create')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)

    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // debounce search 300ms
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchValue), 300)
        return () => clearTimeout(id)
    }, [searchValue])

    const [level, setLevel] = useState<CourseLevel | ''>('')
    const [status, setStatus] = useState<CourseStatus | ''>('')
    const [page, setPage] = useState(1)

    const [sortBy, setSortBy] = useState<SortBy>('created_at')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [includeDeleted] = useState(false)

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, level, status, sortBy, sortOrder])

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

    const coursesQuery = useQuery({
        queryKey: [
            'courses',
            {
                page,
                limit: 100,
                sortBy,
                sortOrder,
                includeDeleted,
            },
        ],
        queryFn: () =>
            listCourses({
                search: '',
                page: 1,
                limit: 100,
                sortBy,
                sortOrder,
                includeDeleted,
            }),
        placeholderData: keepPreviousData,
    })

    const courses = useMemo(() => {
        let filtered = [...(coursesQuery.data?.items ?? [])]

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase().trim()
            filtered = filtered.filter((c) => {
                const name = c.name?.toLowerCase() ?? ''
                const desc = (c.description ?? '').toLowerCase()
                return name.includes(q) || desc.includes(q)
            })
        }

        if (level) {
            filtered = filtered.filter((c) => c.level === level)
        }

        if (status) {
            filtered = filtered.filter((c) => c.status === status)
        }

        const dir = sortOrder === 'asc' ? 1 : -1
        filtered.sort((a, b) => {
            let va: any
            let vb: any
            switch (sortBy) {
                case 'name':
                    va = a.name?.toLowerCase() ?? ''
                    vb = b.name?.toLowerCase() ?? ''
                    break
                case 'fee_amount':
                    va = a.feeAmount ?? 0
                    vb = b.feeAmount ?? 0
                    break
                case 'duration_hours':
                    va = a.durationHours ?? 0
                    vb = b.durationHours ?? 0
                    break
                case 'created_at':
                default:
                    va = a.createdAt
                    vb = b.createdAt
            }
            if (va === vb) return 0
            return va > vb ? dir : -dir
        })

        return filtered
    }, [
        coursesQuery.data?.items,
        debouncedSearch,
        level,
        status,
        sortBy,
        sortOrder,
    ])

    // delete mutation
    const { mutate: doDelete } = useMutation({
        mutationFn: async (course: Course) => {
            if (!window.confirm(`Xóa khóa học "${course.name}"?`)) return
            await deleteCourse(course.id)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (err: any) => {
            window.alert(`Không thể xóa khóa học: ${err.message}`)
        },
    })

    // modal handlers
    const handleOpenCreateModal = () => {
        setEditingCourse(null)
        setIsModalOpen(true)
    }
    const handleOpenEditModal = (c: Course) => {
        setEditingCourse(c)
        setIsModalOpen(true)
    }
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingCourse(null)
    }

    const data = coursesQuery.data
    const isLoading = coursesQuery.isLoading
    const isFetching = coursesQuery.isFetching

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
                <h1 className={s.pageTitle}>Quản lý khóa học</h1>

                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên hoặc mô tả..."
                            value={searchValue}
                            onChange={(e: any) =>
                                setSearchValue(e.target.value)
                            }
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>

                    <div className={s.filterControls}>
                        <SelectField
                            id="levelFilter"
                            label="Cấp độ"
                            registration={{ name: 'levelFilter' as any }}
                            value={level}
                            options={COURSE_LEVEL_OPTIONS}
                            onChange={(e: any) => setLevel(e.target.value)}
                        />

                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={status}
                            options={COURSE_STATUS_OPTIONS}
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

                    {canCreateCourse && (
                        <Button
                            variant="primary"
                            onClick={handleOpenCreateModal}
                        >
                            <img
                                src={IconPlus}
                                alt=""
                                className={s.buttonIcon}
                            />
                            Tạo khóa học
                        </Button>
                    )}
                </Card>

                {/* Table Card */}
                <Card className={s.tableCard} variant="outline">
                    <CourseTable
                        courses={courses}
                        onEditCourse={handleOpenEditModal}
                        onDeleteCourse={(c) => doDelete(c)}
                        isLoading={isLoading || isFetching}
                    />
                </Card>

                <div className={s.pagination}>
                    <div className={s.paginationInfo}>
                        {isFetching ? (
                            <span>Đang tải...</span>
                        ) : (
                            <span>
                                Hiển thị {courses.length} / {data?.total ?? 0}{' '}
                                khóa học
                                {(level || status || debouncedSearch !== '') &&
                                    ' (đã lọc)'}
                            </span>
                        )}
                    </div>

                    <div className={s.paginationControls}>
                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={(data?.page ?? 1) <= 1 || isFetching}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            ← Trước
                        </ButtonPrimary>

                        <span className={s.pageInfo}>
                            Trang {data?.page ?? page} / {data?.pages ?? 1}
                        </span>

                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={
                                (data?.page ?? 1) >= (data?.pages ?? 1) ||
                                isFetching
                            }
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau →
                        </ButtonPrimary>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <CourseFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editing={editingCourse}
                onSaved={() => {
                    qc.invalidateQueries({ queryKey: ['courses'] })
                }}
            />
        </div>
    )
}
