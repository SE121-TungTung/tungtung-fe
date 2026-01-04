import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// Components
import ClassTable from './ClassTable'
import { ClassFormModal } from './ClassFormModal'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import Card from '@/components/common/card/Card'
import Pagination from '@/components/common/menu/Pagination'

// Assets & Styles
import s from './ClassManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'

// Hooks & Types
import { usePermissions } from '@/hooks/usePermissions'
import { useTableParams } from '@/hooks/useTableParams'
import { useDialog } from '@/hooks/useDialog'
import { useClasses, useDeleteClass } from '@/hooks/domain/useClasses'
import { type Class, type ClassStatus } from '@/lib/classes'

// Options Constants
const CLASS_STATUS_OPTIONS = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã lên lịch', value: 'scheduled' },
    { label: 'Đang diễn ra', value: 'active' },
    { label: 'Đã hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
    { label: 'Dời ngày', value: 'postponed' },
]

const SORT_BY_OPTIONS = [
    { label: 'Sắp theo ngày tạo', value: 'created_at' },
    { label: 'Sắp theo tên', value: 'name' },
    { label: 'Sắp theo ngày bắt đầu', value: 'start_date' },
    { label: 'Sắp theo sĩ số', value: 'max_students' },
]

const SORT_ORDER_OPTIONS = [
    { label: 'Giảm dần', value: 'desc' },
    { label: 'Tăng dần', value: 'asc' },
]

// Định nghĩa Filter Interface
interface ClassFilters {
    status: ClassStatus | ''
}

export default function ClassManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const { confirm, alert } = useDialog()
    const canCreateClass = can('class:create')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<Class | null>(null)

    // 1. Setup Table Logic
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
    } = useTableParams<ClassFilters>({
        status: '',
    })

    // 2. Data Fetching Hook
    const {
        data: classesData,
        isLoading,
        isFetching,
    } = useClasses({
        ...apiParams,
        status: (apiParams.status as ClassStatus) || undefined,
        sortDir: apiParams.sortOrder,
        sortBy: apiParams.sortBy,
    })

    // 3. Delete Hook
    const { mutateAsync: deleteClassMutate } = useDeleteClass()

    // Handlers
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

    const handleDeleteClass = async (classItem: Class) => {
        const confirmed = await confirm(`Xóa lớp học "${classItem.name}"?`)
        if (!confirmed) return

        try {
            await deleteClassMutate(classItem.id)
        } catch (err: any) {
            await alert(`Không thể xóa lớp học: ${err.message}`, 'Lỗi')
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Lớp học</h1>

                {/* FILTER CARD */}
                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên lớp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                    </div>
                    <div className={s.filterControls}>
                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={filters.status}
                            options={CLASS_STATUS_OPTIONS}
                            onChange={(e) =>
                                setFilters({
                                    status: e.target.value as ClassStatus | '',
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

                {/* TABLE CARD */}
                <Card className={s.tableCard} variant="outline">
                    <ClassTable
                        classes={classesData?.items || []}
                        onEditClass={handleOpenEditModal}
                        onDeleteClass={handleDeleteClass}
                        isLoading={isLoading || isFetching}
                    />

                    {/* PAGINATION */}
                    <div className={s.pagination}>
                        <Pagination
                            currentPage={page}
                            totalPages={classesData?.pages || 0}
                            onPageChange={setPage}
                        />

                        {!isLoading && classesData && (
                            <div className={s.paginationInfo}>
                                Hiển thị {classesData.items?.length || 0} /{' '}
                                {classesData.total || 0} lớp học
                            </div>
                        )}
                    </div>
                </Card>
            </main>

            {/* MODAL */}
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
