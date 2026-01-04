import React, { useMemo } from 'react'
import s from './Dashboard.module.css'
import { useQuery } from '@tanstack/react-query'

import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import TemplateCard from '@/components/common/card/TemplateCard'
import Skeleton from '@/components/effect/Skeleton'

import ChartBarIcon from '@/assets/Chart Bar.svg'
import ChatIcon from '@/assets/Chat Square Double Text.svg'
import YoutubeIcon from '@/assets/Arrow Right.svg'
import TemplateImg from '@/assets/banner-placeholder.png'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'

import { getMe, getUserOverview, getMyClasses } from '@/lib/users'
import type { StudentOverviewStats } from '@/types/user.types'
import type { Lesson } from '@/components/common/typography/LessonItem'

export default function StudentDashboard() {
    // 1. Fetch User Info
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    // 2. Fetch Overview Stats - Fix bug bằng cách thêm Generic Type <StudentOverviewStats>
    const { data: overviewData, isLoading: statsLoading } = useQuery({
        queryKey: ['user-overview'],
        queryFn: () => getUserOverview<StudentOverviewStats>(),
    })

    // 3. Fetch Classes/Schedule
    const { data: myClasses, isLoading: classesLoading } = useQuery({
        queryKey: ['my-classes'],
        queryFn: () => getMyClasses(),
    })

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    const greetingTexts = useMemo(() => {
        if (!userData) return ['Đang tải dữ liệu...']
        return [
            `Chào mừng quay trở lại, ${userData.firstName}!`,
            'Hôm nay bạn muốn học kỹ năng gì?',
            'Cùng hoàn thành mục tiêu ngày hôm nay nhé!',
        ]
    }, [userData])

    const todaySessions = useMemo(() => {
        if (!myClasses) return []
        const today = new Date().toISOString().split('T')[0]

        const formattedSessions: Lesson[] = []

        myClasses.forEach((myClass) => {
            const filtered = (myClass.sessions || []).filter(
                (s) => s.session_date === today
            )

            filtered.forEach((session) => {
                formattedSessions.push({
                    id: session.id,
                    className: myClass.name,
                    sessionDate: session.session_date,
                    startTime: session.start_time,
                    endTime: session.end_time,
                    status: session.status as any,
                    roomName: myClass.room_name || 'Phòng học',
                })
            })
        })

        return formattedSessions
    }, [myClasses])

    return (
        <div className={s.dashboard}>
            <main className={s.mainContent}>
                {/* 1. WELCOME MESSAGE WITH SKELETON */}
                <h1 className={s.welcomeMessage}>
                    {userLoading ? (
                        <Skeleton
                            width="60%"
                            height="3.5rem"
                            style={{ margin: '0 auto' }}
                        />
                    ) : (
                        <TextType
                            text={greetingTexts}
                            typingSpeed={60}
                            pauseDuration={3000}
                            renderText={(text) => (
                                <>
                                    {text
                                        .split(fullName)
                                        .map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && (
                                                    <span
                                                        className={
                                                            s.gradientText
                                                        }
                                                    >
                                                        {fullName}
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </>
                            )}
                        />
                    )}
                </h1>

                {/* 2. OVERVIEW STATS WITH SKELETON */}
                <Card
                    title="Tổng quan học tập"
                    direction="horizontal"
                    className={s.fullRow}
                >
                    <div className={s.statsGrid}>
                        {statsLoading ? (
                            <Skeleton height={140} variant="rect" count={3} />
                        ) : (
                            <>
                                <StatCard
                                    active
                                    icon={
                                        <img src={ChartBarIcon} alt="stats" />
                                    }
                                    title="Khóa học"
                                    subtitle="Số lượng khóa học bạn đang tham gia"
                                    value={
                                        overviewData?.active_courses?.toString() ||
                                        '0'
                                    }
                                />
                                <StatCard
                                    title="Điểm trung bình"
                                    subtitle="Kết quả trung bình từ các bài thi"
                                    value={
                                        overviewData?.average_test_score?.toString() ||
                                        '0'
                                    }
                                    unit="/10"
                                />
                                <StatCard
                                    title="Bài thi đã làm"
                                    subtitle="Tổng số bài kiểm tra đã hoàn thành"
                                    value={
                                        overviewData?.tests_taken?.toString() ||
                                        '0'
                                    }
                                />
                            </>
                        )}
                    </div>
                </Card>

                {/* 3. LOWER SECTION: SCHEDULE & SUGGESTIONS */}
                <div className={s.mainRow}>
                    <ScheduleTodayCard
                        title="Lịch học hôm nay"
                        sessions={todaySessions}
                        isLoading={classesLoading}
                    />

                    <Card
                        title="Gợi ý từ AI"
                        subtitle="Dựa trên tiến độ học tập của bạn"
                    >
                        <div className={s.suggestionBody}>
                            <div className={s.suggestionTip}>
                                {statsLoading ? (
                                    <div style={{ width: '100%' }}>
                                        <Skeleton
                                            height={20}
                                            width="50%"
                                            style={{ marginBottom: '12px' }}
                                        />
                                        <Skeleton height={60} variant="rect" />
                                    </div>
                                ) : (
                                    <TextHorizontal
                                        icon={<img src={ChatIcon} alt="tip" />}
                                        title="Mẹo học tập"
                                        description="Bạn đã hoàn thành bài thi gần nhất với điểm số khá cao. Hãy thử sức với các bài tập khó hơn nhé!"
                                        mode="light"
                                    />
                                )}
                            </div>

                            <TemplateCard
                                image={TemplateImg}
                                tag={
                                    <>
                                        <img
                                            src={ChatIcon}
                                            width={14}
                                            alt="tag"
                                        />
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
                                        alt="cta"
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
