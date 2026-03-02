import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import CourseTable from './CourseTable'
import { CourseFormModal } from './CourseFormModal'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import Card from '@/components/common/card/Card'
import Pagination from '@/components/common/menu/Pagination'

import s from './CourseManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'

import { usePermissions } from '@/hooks/usePermissions'
import { useTableParams } from '@/hooks/useTableParams'
import { useDialog } from '@/hooks/useDialog'
import { useCourses, useDeleteCourse } from '@/hooks/domain/useCourses'

import {
    type Course,
    type CourseStatus,
    type CourseLevel,
    type ListCoursesParams,
} from '@/lib/courses'

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
    { label: 'Sắp theo ngày tạo', value: 'created_at' },
    { label: 'Sắp theo tên', value: 'name' },
    { label: 'Sắp theo học phí', value: 'fee_amount' },
    { label: 'Sắp theo thời lượng', value: 'duration_hours' },
]

const SORT_ORDER_OPTIONS = [
    { label: 'Giảm dần', value: 'desc' },
    { label: 'Tăng dần', value: 'asc' },
]

interface CourseFilters {
    level: CourseLevel | ''
    status: CourseStatus | ''
}

export default function CourseManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const { confirm, alert } = useDialog()
    const canCreateCourse = can('course:create')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)

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
    } = useTableParams<CourseFilters>({
        level: '',
        status: '',
    })

    const {
        data: coursesData,
        isLoading,
        isFetching,
    } = useCourses({
        ...apiParams,
        level: (apiParams.level as CourseLevel) || undefined,
        status: (apiParams.status as CourseStatus) || undefined,
        sortBy: apiParams.sortBy as ListCoursesParams['sortBy'],
        sortOrder: sort.order as 'asc' | 'desc',
    })

    const { mutateAsync: deleteCourseMutate } = useDeleteCourse()

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

    const handleDeleteCourse = async (course: Course) => {
        const confirmed = await confirm(`Xóa khóa học "${course.name}"?`)
        if (!confirmed) return

        try {
            await deleteCourseMutate(course.id)
        } catch (err: any) {
            await alert(`Không thể xóa khóa học: ${err.message}`, 'Lỗi')
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý khóa học</h1>

                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên hoặc mô tả..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>

                    <div className={s.filterControls}>
                        <SelectField
                            id="levelFilter"
                            label="Cấp độ"
                            registration={{ name: 'levelFilter' as any }}
                            value={filters.level}
                            options={COURSE_LEVEL_OPTIONS}
                            onChange={(e) =>
                                setFilters({
                                    level: e.target.value as CourseLevel | '',
                                })
                            }
                        />

                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={filters.status}
                            options={COURSE_STATUS_OPTIONS}
                            onChange={(e) =>
                                setFilters({
                                    status: e.target.value as CourseStatus | '',
                                })
                            }
                        />

                        <SelectField
                            id="sortBy"
                            label="Sắp xếp"
                            registration={{ name: 'sortBy' as any }}
                            value={sort.field}
                            onChange={(e) =>
                                setSort({ ...sort, field: e.target.value })
                            }
                            options={SORT_BY_OPTIONS}
                        />

                        <SelectField
                            id="sortOrder"
                            label="Thứ tự"
                            registration={{ name: 'sortOrder' as any }}
                            value={sort.order}
                            onChange={(e) =>
                                setSort({
                                    ...sort,
                                    order: e.target.value as 'asc' | 'desc',
                                })
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

                <Card className={s.tableCard} variant="outline">
                    <CourseTable
                        courses={coursesData?.items || []}
                        onEditCourse={handleOpenEditModal}
                        onDeleteCourse={handleDeleteCourse}
                        isLoading={isLoading || isFetching}
                    />

                    <div className={s.pagination}>
                        <Pagination
                            currentPage={page}
                            totalPages={coursesData?.pages || 0}
                            onPageChange={setPage}
                        />

                        {!isLoading && coursesData && (
                            <div className={s.paginationInfo}>
                                Hiển thị {coursesData.items?.length || 0} /{' '}
                                {coursesData.total || 0} khóa học
                            </div>
                        )}
                    </div>
                </Card>
            </main>

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
