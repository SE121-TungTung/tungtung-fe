import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherClasses, type Class, type ClassStatus } from '@/lib/classes'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import Card from '@/components/common/card/Card'
import s from './TeacherClassPage.module.css'
import IconSearch from '@/assets/Lens.svg'
import TeacherClassTable from './TeacherClassTable'

// Các option filter/sort
const CLASS_STATUS_OPTIONS: { label: string; value: ClassStatus | '' }[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang diễn ra', value: 'active' },
    { label: 'Sắp diễn ra', value: 'scheduled' },
    { label: 'Đã hoàn thành', value: 'completed' },
]

const SORT_OPTIONS = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Tên lớp A-Z', value: 'name_asc' },
    { label: 'Sĩ số đông nhất', value: 'students_desc' },
]

export default function TeacherClassPage() {
    // State Filter & Sort
    const [searchValue, setSearchValue] = useState('')
    const [statusFilter, setStatusFilter] = useState<ClassStatus | ''>('')
    const [sortBy, setSortBy] = useState<string>('newest')

    // 1. Fetch Data
    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['teacher-classes'],
        queryFn: getTeacherClasses,
        staleTime: 5 * 60 * 1000, // Cache 5 phút
    })

    // 2. Client-side Filter & Sort logic
    const filteredClasses = useMemo(() => {
        let result = [...classes]

        // Filter by Status
        if (statusFilter) {
            result = result.filter((c) => c.status === statusFilter)
        }

        // Filter by Search (Name or Room)
        if (searchValue.trim()) {
            const q = searchValue.toLowerCase().trim()
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.room.name.toLowerCase().includes(q) ||
                    c.course.name.toLowerCase().includes(q)
            )
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name)
                case 'students_desc':
                    return b.currentStudents - a.currentStudents
                case 'newest':
                default:
                    return (
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime()
                    )
            }
        })

        return result
    }, [classes, statusFilter, searchValue, sortBy])

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Lớp học của tôi</h1>

                {/* Filter Area */}
                <Card className={s.filterCard} variant="outline">
                    <div className={s.filterRow}>
                        <div className={s.searchWrapper}>
                            <InputField
                                label="Tìm kiếm"
                                placeholder="Nhập tên lớp, phòng hoặc khóa học..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                leftIcon={<img src={IconSearch} alt="" />}
                                fullWidth
                            />
                        </div>
                        <div className={s.filterControls}>
                            <SelectField
                                label="Trạng thái"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value as ClassStatus
                                    )
                                }
                                options={CLASS_STATUS_OPTIONS}
                            />
                            <SelectField
                                label="Sắp xếp"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={SORT_OPTIONS}
                            />
                        </div>
                    </div>
                </Card>

                {/* Table Area */}
                <Card className={s.tableCard} variant="outline">
                    <TeacherClassTable
                        classes={filteredClasses}
                        isLoading={isLoading}
                    />

                    {!isLoading && (
                        <div
                            style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: '13px',
                            }}
                        >
                            Hiển thị {filteredClasses.length} / {classes.length}{' '}
                            lớp học
                        </div>
                    )}
                </Card>
            </main>
        </div>
    )
}
