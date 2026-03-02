import { useState } from 'react' // [FIX] Bỏ useMemo thừa
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import s from '@/pages/student/class/Class.module.css'

// Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import MemberList from '@/pages/student/class/MemberList'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import BackIcon from '@/assets/arrow-left.svg'
import InputField from '@/components/common/input/InputField' // [FIX] Import InputField để làm search
import SearchIcon from '@/assets/Book Search.svg' // [FIX] Icon search

// API & Types
import { getClass } from '@/lib/classes'
// [FIX] Xóa import ClassStatus thừa vì không dùng trong logic render
// import { ClassStatus } from '@/lib/classes'

const tabItems: TabItem[] = [
    { label: 'Tổng quan', value: 'overview' },
    { label: 'Thành viên', value: 'members' },
    { label: 'Lịch học', value: 'schedule' },
]

export default function TeacherClassDetailPage() {
    const { classId } = useParams<{ classId: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [searchTerm, setSearchTerm] = useState('') // [FIX] Sẽ được dùng ở InputField bên dưới

    // 1. Fetch Class Detail
    const { data: classDetail, isLoading } = useQuery({
        queryKey: ['class', classId],
        queryFn: () => getClass(classId!),
        enabled: !!classId,
    })

    const members = (classDetail as any)?.students || []

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className={s.placeholderContent}>
                        <div
                            style={{
                                maxWidth: 600,
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    padding: 24,
                                    borderRadius: 12,
                                    border: '1px solid #eee',
                                }}
                            >
                                <h3 style={{ marginBottom: 16 }}>
                                    Thông tin lớp học
                                </h3>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 16,
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Khóa học
                                        </label>
                                        <p style={{ fontWeight: 600 }}>
                                            {classDetail?.course?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Phòng học
                                        </label>
                                        <p style={{ fontWeight: 600 }}>
                                            {classDetail?.room?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Thời gian
                                        </label>
                                        <p>
                                            {new Date(
                                                classDetail?.startDate || ''
                                            ).toLocaleDateString('vi-VN')}{' '}
                                            -{' '}
                                            {new Date(
                                                classDetail?.endDate || ''
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Sĩ số
                                        </label>
                                        <p>
                                            {classDetail?.currentStudents} /{' '}
                                            {classDetail?.maxStudents}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <label
                                        style={{ fontSize: 12, color: '#666' }}
                                    >
                                        Ghi chú
                                    </label>
                                    <p>
                                        {classDetail?.notes ||
                                            'Không có ghi chú'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'members':
                return (
                    <div style={{ width: '100%', maxWidth: 800 }}>
                        {/* [FIX] Thêm thanh tìm kiếm để setSearchTerm được sử dụng */}
                        <div style={{ marginBottom: 16 }}>
                            <InputField
                                placeholder="Tìm kiếm học viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                leftIcon={<img src={SearchIcon} alt="" />}
                            />
                        </div>

                        <MemberList
                            members={members}
                            searchTerm={searchTerm}
                            filterRole="student"
                            // [FIX] Bỏ props onChat vì MemberList chưa hỗ trợ.
                            // Nếu muốn dùng, bạn cần vào MemberList.tsx thêm prop `onChat?: (id: string) => void` vào interface Props
                            // onChat={(memberId) => navigate(`/messages?chatWith=${memberId}`)}
                        />
                    </div>
                )

            case 'schedule':
                return (
                    <div className={s.placeholderContent}>
                        <div className={s.placeholderBox}>
                            <p>
                                Lịch học:{' '}
                                {JSON.stringify(
                                    classDetail?.scheduleDefinition
                                )}
                            </p>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (isLoading) {
        return <div className="spinner-center">Đang tải thông tin...</div>
    }

    if (!classDetail) {
        return <div>Không tìm thấy lớp học</div>
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <div
                className={s.header}
                style={{ width: '100%', maxWidth: 1000, alignSelf: 'center' }}
            >
                <ButtonGhost
                    onClick={() => navigate('/teacher/classes')}
                    style={{ marginBottom: 16, paddingLeft: 0 }}
                    leftIcon={<img src={BackIcon} alt="" />}
                >
                    Quay lại danh sách
                </ButtonGhost>

                <h1 className={s.pageTitle} style={{ textAlign: 'left' }}>
                    {classDetail.name}
                </h1>
                <p style={{ color: '#666', marginTop: 8 }}>
                    {classDetail.course?.name} • {classDetail.room?.name}
                </p>

                <div className={s.tabs} style={{ marginTop: 24 }}>
                    <TabMenu
                        items={tabItems}
                        value={activeTab}
                        onChange={setActiveTab}
                        variant="flat"
                        activeStyle="underline"
                        fullWidth
                    />
                </div>

                <div style={{ marginTop: 24 }}>{renderTabContent()}</div>
            </div>
        </div>
    )
}
