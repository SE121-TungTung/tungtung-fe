import React, { useMemo } from 'react'
import s from './Dashboard.module.css'
import { useMutation, useQuery } from '@tanstack/react-query'
import { isSameDay, isWithinInterval, parseISO } from 'date-fns'

import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import TemplateCard from '@/components/common/card/TemplateCard'

import ChartBarIcon from '@/assets/Chart Bar.svg'
import ChatIcon from '@/assets/Chat Square Double Text.svg'
import YoutubeIcon from '@/assets/Arrow Right.svg'
import TemplateImg from '@/assets/banner-placeholder.png'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'
import CheckIcon from '@/assets/Check Circle.svg'
import IconRefresh from '@/assets/Refresh.svg'

import { getMe, getUserOverview, getMyClasses } from '@/lib/users'
import type {
    Lesson,
    LessonStatus,
} from '@/components/common/typography/LessonItem'
import { getSessionAttendance, selfCheckIn } from '@/lib/attendance'
import { queryClient } from '@/lib/query'
import { useDialog } from '@/hooks/useDialog'
import ButtonGlow from '@/components/common/button/ButtonGlow'

export default function StudentDashboard() {
    const { alert: showAlert } = useDialog()
    // 1. Fetch User Info
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
    })

    // 2. Fetch Overview Stats
    const { data: statsData } = useQuery({
        queryKey: ['student-overview'],
        queryFn: getUserOverview,
    })

    // 3. Fetch Classes & Sessions
    const { data: myClasses = [] } = useQuery({
        queryKey: ['my-classes'],
        queryFn: getMyClasses,
    })

    const activeSession = useMemo(() => {
        const now = new Date()
        let foundSession: { sessionId: string; classId: string } | null = null

        // Loop qua tất cả các lớp để tìm session đang diễn ra
        for (const cls of myClasses) {
            if (!cls.sessions) continue
            for (const session of cls.sessions) {
                const sessionDateStr = session.session_date // YYYY-MM-DD

                // Parse start/end time kết hợp với date
                // Giả sử start_time dạng "08:00:00"
                const startDateTime = parseISO(
                    `${sessionDateStr}T${session.start_time}`
                )
                const endDateTime = parseISO(
                    `${sessionDateStr}T${session.end_time}`
                )

                // Kiểm tra active: Thời gian hiện tại nằm trong khoảng diễn ra session
                // Mở rộng thêm 15 phút trước giờ học để cho phép điểm danh sớm
                const checkInWindowStart = new Date(
                    startDateTime.getTime() - 15 * 60000
                )

                if (
                    isWithinInterval(now, {
                        start: checkInWindowStart,
                        end: endDateTime,
                    })
                ) {
                    foundSession = { sessionId: session.id, classId: cls.id }
                    break
                }
            }
            if (foundSession) break
        }
        return foundSession
    }, [myClasses])

    const { data: attendanceRecords = [] } = useQuery({
        queryKey: ['session-attendance', activeSession?.sessionId],
        queryFn: () => getSessionAttendance(activeSession!.sessionId),
        enabled: !!activeSession?.sessionId, // Chỉ fetch khi có session đang diễn ra
        refetchInterval: 10000, // Auto refresh mỗi 10s để cập nhật trạng thái
    })

    const isCheckedIn = useMemo(() => {
        if (!userData || !attendanceRecords.length) return false
        return attendanceRecords.some(
            (r) => r.student_id === userData.id && r.status === 'present'
        )
    }, [attendanceRecords, userData])

    const checkInMutation = useMutation({
        mutationFn: (sessionId: string) => selfCheckIn(sessionId),
        onSuccess: () => {
            showAlert('Điểm danh thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['session-attendance'] })
            queryClient.invalidateQueries({ queryKey: ['student-overview'] })
        },
        onError: (error: any) => {
            showAlert(
                error?.message || 'Điểm danh thất bại. Vui lòng thử lại.',
                'Lỗi'
            )
        },
    })

    const handleCheckIn = () => {
        if (activeSession) {
            checkInMutation.mutate(activeSession.sessionId)
        } else {
            showAlert(
                'Hiện tại không có tiết học nào diễn ra để điểm danh.',
                'Lỗi'
            )
        }
    }

    // --- Xử lý dữ liệu Stats ---
    const stats = useMemo(
        () => [
            {
                id: 's1',
                title: 'Lớp đang học',
                value: statsData?.active_courses?.toString() || '0',
                subtitle: 'Số lớp học đang kích hoạt',
                unit: '',
                active: true,
            },
            {
                id: 's2',
                title: 'Điểm trung bình',
                value: statsData?.average_test_score?.toString() || '0',
                unit: '',
                subtitle: 'Điểm số trung bình các bài kiểm tra',
            },
            {
                id: 's3',
                title: 'Bài kiểm tra',
                value: statsData?.tests_taken?.toString() || '0',
                unit: '',
                subtitle: 'Tổng số bài kiểm tra đã hoàn thành',
            },
        ],
        [statsData]
    )

    const todaySessions = useMemo<Lesson[]>(() => {
        if (!myClasses.length) return []
        const today = new Date()
        const sessionsList: Lesson[] = []

        myClasses.forEach((cls) => {
            if (!cls.sessions) return
            cls.sessions.forEach((session) => {
                const sessionDate = parseISO(session.session_date)
                if (isSameDay(sessionDate, today)) {
                    sessionsList.push({
                        id: session.id,
                        sessionDate: session.session_date,
                        startTime: session.start_time.slice(0, 5),
                        endTime: session.end_time.slice(0, 5),
                        className: cls.name,
                        courseName: cls.course_name || 'N/A',
                        teacherName: cls.teacher?.full_name || 'Chưa phân công',
                        roomName: session.room_id
                            ? `Phòng ${session.room_id}`
                            : cls.room_name || 'Online',
                        status: session.status as LessonStatus,
                        attendanceTaken: false,
                    })
                }
            })
        })
        return sessionsList.sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
        )
    }, [myClasses])

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    const greetingTexts = userData
        ? [`Xin chào, ${fullName}!`, `Chúc bạn một ngày học tập hiệu quả!`]
        : ['Xin chào!', 'Chào mừng trở lại!']

    const renderCheckInButton = () => {
        if (isCheckedIn) {
            return (
                <ButtonGlow
                    size="sm"
                    variant="outline"
                    disabled
                    style={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        cursor: 'default',
                    }}
                    rightIcon={
                        <img src={CheckIcon} alt="" style={{ width: 14 }} />
                    }
                >
                    Đã điểm danh
                </ButtonGlow>
            )
        }

        if (activeSession) {
            return (
                <ButtonGlow
                    size="sm"
                    variant="outline"
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                    rightIcon={<img src={IconRefresh} alt="" />}
                >
                    {checkInMutation.isPending
                        ? 'Đang xử lý...'
                        : 'Điểm danh ngay'}
                </ButtonGlow>
            )
        }

        return null
    }

    return (
        <div className={s.dashboard}>
            <h1 className={s.welcomeMessage}>
                {!userLoading && userData && (
                    <TextType
                        text={greetingTexts}
                        typingSpeed={70}
                        pauseDuration={5000}
                        deletingSpeed={50}
                        renderText={(text) => {
                            const namePattern = new RegExp(fullName, 'g')
                            const parts = text.split(namePattern)
                            const names = text.match(namePattern) || []

                            return (
                                <>
                                    {parts.map((part, i) => (
                                        <React.Fragment key={i}>
                                            {part}
                                            {names[i] && (
                                                <span
                                                    className={s.gradientText}
                                                >
                                                    {names[i]}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </>
                            )
                        }}
                    />
                )}
            </h1>

            {/* Main Content */}
            <main className={s.mainContent}>
                <Card
                    title="Tổng quan học tập"
                    subtitle="Tiến độ và kết quả gần đây của bạn"
                    direction="horizontal"
                >
                    <div className={s.statsGrid}>
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                title={stat.title}
                                value={stat.value}
                                unit={stat.unit}
                                subtitle={stat.subtitle}
                                active={stat.active}
                                icon={<img src={ChartBarIcon} alt="" />}
                            />
                        ))}
                    </div>
                </Card>

                <div className={s.mainRow}>
                    <ScheduleTodayCard
                        sessions={todaySessions}
                        // Truyền null vào onCheckIn để ẩn nút mặc định bên trong component nếu ta muốn custom control
                        onCheckIn={undefined}
                        // Truyền nút custom vào props controls (Bạn cần update ScheduleTodayCard để nhận prop này nếu chưa có)
                        // Hoặc sử dụng logic dưới đây nếu ScheduleTodayCard chỉ nhận onCheckIn:
                        controls={renderCheckInButton()}
                    />

                    <Card
                        title="Hôm nay làm gì?"
                        subtitle="Dựa trên lộ trình học được AI đề xuất"
                    >
                        <div className={s.suggestionBody}>
                            <div className={s.suggestionTip}>
                                <TextHorizontal
                                    icon={<img src={ChatIcon} alt="tip icon" />}
                                    iconStyle="flat"
                                    title="Mẹo thi cử"
                                    description="Trong bài kiểm tra Listening, hãy tập trung nghe vào Keyword để tìm ra đáp án đúng!"
                                    mode="light"
                                />
                            </div>

                            <TemplateCard
                                image={TemplateImg}
                                tag={
                                    <>
                                        <img
                                            src={ChatIcon}
                                            width={14}
                                            alt="tag icon"
                                        />{' '}
                                        <span>Speaking</span>
                                    </>
                                }
                                title="Luyện phát âm đuôi /ed/"
                                excerpt="Bài học ngắn giúp bạn nắm vững quy tắc phát âm đuôi /ed/ trong 5 phút."
                                ctaText="Xem ngay"
                                ctaIcon={
                                    <img
                                        src={YoutubeIcon}
                                        width={14}
                                        alt="cta icon"
                                    />
                                }
                            />
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
