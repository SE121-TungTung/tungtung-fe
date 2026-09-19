import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import s from './Class.module.css'

// Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import TextType from '@/components/common/text/TextType'
import ClassScheduleTab from './tabs/ClassScheduleTab'
import ClassNewsTab from './tabs/ClassNewsTab'
import ClassMembersTab from './tabs/ClassMembersTab'
import QrScannerModal from './modals/QrScannerModal'

// Helpers & API
import {
    mapClassSessions,
    filterTodaySessions,
    mapClassMembers,
} from './helpers/class.helpers'
import { getMyClasses } from '@/lib/users'
import { selfCheckIn } from '@/lib/attendance'
import type { MyClass } from '@/types/user.types'
import { useDialog } from '@/hooks/useDialog'

const tabItems: TabItem[] = [
    { label: 'Lịch học', value: 'schedule' },
    { label: 'Bảng tin', value: 'news' },
    { label: 'Thành viên', value: 'members' },
]

export default function ClassPage() {
    const [activeTab, setActiveTab] = useState('schedule')
    const [showGradientName, setShowGradientName] = useState(false)
    const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    // 1. Fetch lớp học của học viên
    const { data: myClasses, isLoading: classesLoading } = useQuery({
        queryKey: ['my-classes'],
        queryFn: getMyClasses,
    })

    const currentClass = useMemo(() => {
        if (Array.isArray(myClasses)) return myClasses[0] as MyClass
        // @ts-expect-error to ignore
        if (myClasses?.classes) return myClasses.classes[0] as MyClass
        return undefined
    }, [myClasses])

    // 2. Data transformation qua pure helpers
    const allSessions = useMemo(
        () => mapClassSessions(currentClass),
        [currentClass]
    )
    const todaySessions = useMemo(
        () => filterTodaySessions(allSessions),
        [allSessions]
    )
    const classMembers = useMemo(
        () => mapClassMembers(currentClass),
        [currentClass]
    )

    // 3. Mutation điểm danh
    const checkInMutation = useMutation({
        mutationFn: ({
            sessionId,
            qrToken,
        }: {
            sessionId: string
            qrToken?: string
        }) => selfCheckIn(sessionId, qrToken),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            alert(res.message || 'Điểm danh thành công!', 'Thành công')
            setIsQRScannerOpen(false)
        },
        onError: (err: any) => {
            alert(
                err?.message ||
                    'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại!',
                'Thất bại'
            )
        },
    })

    const handleCheckInToday = useCallback(() => {
        const checkInTarget = todaySessions.find((s) => !s.attendanceTaken)
        if (!checkInTarget) {
            if (todaySessions.length === 0) {
                alert(
                    'Hôm nay bạn không có lịch học để điểm danh.',
                    'Thông báo'
                )
            } else {
                alert(
                    'Bạn đã điểm danh cho tất cả các buổi học hôm nay rồi!',
                    'Thông báo'
                )
            }
            return
        }
        checkInMutation.mutate({ sessionId: checkInTarget.id })
    }, [todaySessions, checkInMutation, alert])

    const handleQrCheckIn = useCallback(
        (qrToken: string) => {
            const sessionToUse =
                todaySessions[0]?.id || currentClass?.sessions?.[0]?.id
            if (!sessionToUse) {
                alert('Không tìm thấy buổi học nào để điểm danh.', 'Lỗi')
                return
            }
            checkInMutation.mutate({
                sessionId: sessionToUse,
                qrToken,
            })
        },
        [todaySessions, currentClass, checkInMutation, alert]
    )

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const className = currentClass?.name || 'Lớp học của tôi'

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    {!classesLoading && currentClass ? (
                        <>
                            <TextType
                                text="Xin chào, đây là "
                                typingSpeed={50}
                                loop={false}
                                showCursor={!showGradientName}
                                onSentenceComplete={handleGreetingComplete}
                            />
                            {showGradientName && (
                                <TextType
                                    as="span"
                                    className={s.gradientText}
                                    text={className}
                                    typingSpeed={70}
                                    loop={false}
                                />
                            )}
                        </>
                    ) : classesLoading ? (
                        <span>Đang tải dữ liệu...</span>
                    ) : (
                        <span>Bạn chưa tham gia lớp học nào</span>
                    )}
                </h1>

                {currentClass && (
                    <div className={s.tabs}>
                        <TabMenu
                            items={tabItems}
                            value={activeTab}
                            onChange={(val) => setActiveTab(val)}
                            variant="flat"
                            activeStyle="underline"
                            fullWidth
                        />
                    </div>
                )}

                {classesLoading ? (
                    <div className={s.placeholderContent}>
                        <div className={s.placeholderBox}>
                            <div className="spinner"></div>
                            <p>Đang tải thông tin lớp học...</p>
                        </div>
                    </div>
                ) : currentClass ? (
                    <>
                        {activeTab === 'schedule' && (
                            <ClassScheduleTab
                                todaySessions={todaySessions}
                                allSessions={allSessions}
                                onOpenQrScanner={() => setIsQRScannerOpen(true)}
                                onCheckInToday={handleCheckInToday}
                            />
                        )}
                        {activeTab === 'news' && (
                            <ClassNewsTab classId={currentClass.id} />
                        )}
                        {activeTab === 'members' && (
                            <ClassMembersTab members={classMembers} />
                        )}
                    </>
                ) : (
                    <div className={s.placeholderContent}>
                        <div className={s.placeholderBox}>
                            <h2>Chưa có lớp học</h2>
                            <p>
                                Hiện tại bạn chưa được thêm vào lớp học nào
                                trong hệ thống.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <QrScannerModal
                isOpen={isQRScannerOpen}
                onClose={() => setIsQRScannerOpen(false)}
                onCheckIn={handleQrCheckIn}
                isSubmitting={checkInMutation.isPending}
            />
        </div>
    )
}
