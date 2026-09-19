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

// AI Recommendation Icons
import BookOpenIcon from '@/assets/Book Open.svg'
import HeadphoneIcon from '@/assets/Headphone.svg'
import PenIcon from '@/assets/Pen.svg'
import MicrophoneIcon from '@/assets/Microphone.svg'
import CheckBadgeIcon from '@/assets/Check Badge.svg'
import IdeaIcon from '@/assets/Light Bulb Idea.svg'
import RobotIcon from '@/assets/Robot.svg'
import BookReaderIcon from '@/assets/Book Reader.svg'

import { getMe, getUserOverview, getMyClasses } from '@/lib/users'
import { getTodayRecommendation } from '@/lib/recommendations'
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

    // 4. Fetch AI Recommendation
    const { data: recData, isLoading: recLoading } = useQuery({
        queryKey: ['today-recommendation'],
        queryFn: () => getTodayRecommendation(),
    })

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    const greetingTexts = useMemo(() => {
        if (!userData) return ['Đang tải dữ liệu...']
        return [
            `Chào mừng quay trở lại, ${userData.firstName} ${userData.lastName}!`,
            'Hôm nay bạn muốn học kỹ năng gì?',
            'Cùng hoàn thành mục tiêu ngày hôm nay nhé!',
        ]
    }, [userData])

    const todaySessions = useMemo(() => {
        if (!myClasses) return []
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

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
                        {recLoading ? (
                            <Skeleton height={140} variant="rect" count={1} />
                        ) : (
                            <StatCard
                                title="Điểm dự kiến (AI)"
                                subtitle="Dự đoán band score dựa trên kết quả thi"
                                value={
                                    recData?.predicted_band !== undefined &&
                                    recData?.predicted_band !== null
                                        ? recData.predicted_band.toString()
                                        : 'N/A'
                                }
                                unit={
                                    recData?.predicted_cefr
                                        ? ` (${recData.predicted_cefr})`
                                        : ''
                                }
                            />
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
                                {recLoading ? (
                                    <div style={{ width: '100%' }}>
                                        <Skeleton
                                            height={20}
                                            width="50%"
                                            style={{ marginBottom: '12px' }}
                                        />
                                        <Skeleton height={60} variant="rect" />
                                    </div>
                                ) : (
                                    <div className={s.tipsList}>
                                        {recData?.nudge && (
                                            <div
                                                style={{ marginBottom: '16px' }}
                                            >
                                                <TextHorizontal
                                                    icon={
                                                        <img
                                                            src={RobotIcon}
                                                            alt="AI"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                            }}
                                                        />
                                                    }
                                                    title="AI khích lệ"
                                                    description={
                                                        recData.nudge.message
                                                    }
                                                    mode="light"
                                                />
                                            </div>
                                        )}
                                        {recData?.recommendation_data
                                            ?.suggested_course && (
                                            <div
                                                className={
                                                    s.courseSuggestionCard
                                                }
                                            >
                                                <div
                                                    className={
                                                        s.courseSuggestionHeader
                                                    }
                                                >
                                                    <img
                                                        src={BookReaderIcon}
                                                        alt="Course"
                                                        className={
                                                            s.courseSuggestionIcon
                                                        }
                                                    />
                                                    <h4
                                                        className={
                                                            s.courseSuggestionTitle
                                                        }
                                                    >
                                                        Gợi ý Khóa học Tiếp theo
                                                    </h4>
                                                </div>
                                                <p
                                                    className={
                                                        s.courseSuggestionText
                                                    }
                                                >
                                                    Dựa trên dự đoán band{' '}
                                                    <strong>
                                                        {recData.predicted_band}
                                                    </strong>
                                                    , bạn đã đủ điều kiện tham
                                                    gia:
                                                </p>
                                                <strong
                                                    className={s.courseName}
                                                >
                                                    {
                                                        recData
                                                            .recommendation_data
                                                            .suggested_course
                                                            .name
                                                    }
                                                </strong>
                                                <p className={s.courseTarget}>
                                                    Mục tiêu khóa học: Band{' '}
                                                    {
                                                        recData
                                                            .recommendation_data
                                                            .suggested_course
                                                            .target_band
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {(() => {
                                            const tips =
                                                recData?.recommendation_data
                                                    ?.tips
                                            // New structured format: { reading: [...], listening: [...], ... }
                                            const isStructured =
                                                tips &&
                                                typeof tips === 'object' &&
                                                !Array.isArray(tips)

                                            if (isStructured) {
                                                const skillConfig = [
                                                    {
                                                        key: 'reading',
                                                        label: 'Reading',
                                                        icon: BookOpenIcon,
                                                    },
                                                    {
                                                        key: 'listening',
                                                        label: 'Listening',
                                                        icon: HeadphoneIcon,
                                                    },
                                                    {
                                                        key: 'writing',
                                                        label: 'Writing',
                                                        icon: PenIcon,
                                                    },
                                                    {
                                                        key: 'speaking',
                                                        label: 'Speaking',
                                                        icon: MicrophoneIcon,
                                                    },
                                                    {
                                                        key: 'overall',
                                                        label: 'Tổng hợp',
                                                        icon: CheckBadgeIcon,
                                                    },
                                                ]

                                                const hasAnyTips =
                                                    skillConfig.some(
                                                        (sk) =>
                                                            (
                                                                tips as Record<
                                                                    string,
                                                                    string[]
                                                                >
                                                            )[sk.key]?.length >
                                                            0
                                                    )

                                                if (!hasAnyTips) {
                                                    return (
                                                        <TextHorizontal
                                                            icon={
                                                                <img
                                                                    src={
                                                                        ChatIcon
                                                                    }
                                                                    alt="tip"
                                                                />
                                                            }
                                                            title="Mẹo học tập"
                                                            description="Bạn chưa có đủ lịch sử bài thi để AI phân tích. Hãy hoàn thành các bài test để nhận gợi ý nhé!"
                                                            mode="light"
                                                        />
                                                    )
                                                }

                                                return (
                                                    <>
                                                        <div
                                                            className={
                                                                s.tipsSectionHeader
                                                            }
                                                        >
                                                            <img
                                                                src={IdeaIcon}
                                                                alt="AI Suggestions"
                                                                className={
                                                                    s.tipsSectionIcon
                                                                }
                                                            />
                                                            <h4
                                                                className={
                                                                    s.tipsTitle
                                                                }
                                                            >
                                                                Gợi ý từ AI theo
                                                                kỹ năng
                                                            </h4>
                                                        </div>
                                                        {skillConfig.map(
                                                            (sk) => {
                                                                const skillTips =
                                                                    (
                                                                        tips as Record<
                                                                            string,
                                                                            string[]
                                                                        >
                                                                    )[sk.key]
                                                                if (
                                                                    !skillTips ||
                                                                    skillTips.length ===
                                                                        0
                                                                )
                                                                    return null
                                                                return (
                                                                    <div
                                                                        key={
                                                                            sk.key
                                                                        }
                                                                        className={
                                                                            s.skillGroup
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                s.skillHeader
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    sk.icon
                                                                                }
                                                                                alt={
                                                                                    sk.label
                                                                                }
                                                                                className={
                                                                                    s.skillIcon
                                                                                }
                                                                            />
                                                                            {
                                                                                sk.label
                                                                            }
                                                                        </div>
                                                                        <ul
                                                                            className={
                                                                                s.skillTipsUl
                                                                            }
                                                                        >
                                                                            {skillTips.map(
                                                                                (
                                                                                    tip: string,
                                                                                    idx: number
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className={
                                                                                            s.skillTipLi
                                                                                        }
                                                                                        data-skill={
                                                                                            sk.key
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            tip
                                                                                        }
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )
                                                            }
                                                        )}
                                                    </>
                                                )
                                            }

                                            // Legacy flat array format
                                            if (
                                                Array.isArray(tips) &&
                                                tips.length > 0
                                            ) {
                                                return (
                                                    <>
                                                        <div
                                                            className={
                                                                s.tipsSectionHeader
                                                            }
                                                        >
                                                            <img
                                                                src={IdeaIcon}
                                                                alt="AI Suggestions"
                                                                className={
                                                                    s.tipsSectionIcon
                                                                }
                                                            />
                                                            <h4
                                                                className={
                                                                    s.tipsTitle
                                                                }
                                                            >
                                                                Mẹo học tập từ
                                                                AI
                                                            </h4>
                                                        </div>
                                                        <ul
                                                            className={s.tipsUl}
                                                        >
                                                            {tips.map(
                                                                (
                                                                    tip: string,
                                                                    idx: number
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className={
                                                                            s.tipLi
                                                                        }
                                                                    >
                                                                        {tip}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </>
                                                )
                                            }

                                            return (
                                                <TextHorizontal
                                                    icon={
                                                        <img
                                                            src={ChatIcon}
                                                            alt="tip"
                                                        />
                                                    }
                                                    title="Mẹo học tập"
                                                    description="Bạn chưa có đủ lịch sử bài thi để AI phân tích. Hãy hoàn thành các bài test để nhận gợi ý nhé!"
                                                    mode="light"
                                                />
                                            )
                                        })()}
                                    </div>
                                )}
                            </div>

                            {recLoading ? (
                                <Skeleton height={200} variant="rect" />
                            ) : recData?.recommendation_data?.materials &&
                              recData.recommendation_data.materials.length >
                                  0 ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <h4
                                        style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            color: '#1e293b',
                                        }}
                                    >
                                        📚 Tài liệu luyện tập gợi ý (RAG):
                                    </h4>
                                    {recData.recommendation_data.materials.map(
                                        (mat: any, idx: number) => (
                                            <TemplateCard
                                                key={idx}
                                                image={TemplateImg}
                                                tag={
                                                    <>
                                                        <img
                                                            src={ChatIcon}
                                                            width={14}
                                                            alt="tag"
                                                        />
                                                        <span>
                                                            {mat.source ||
                                                                'Tài liệu hệ thống'}
                                                        </span>
                                                    </>
                                                }
                                                title={mat.title}
                                                excerpt={`Tài liệu được AI trích xuất phù hợp với kỹ năng ${recData.weakest_skill || 'đang yếu'} của bạn. Độ phù hợp: ${mat.relevance_score * 100}%`}
                                                ctaText="Xem tài liệu"
                                                ctaIcon={
                                                    <img
                                                        src={YoutubeIcon}
                                                        width={14}
                                                        alt="cta"
                                                    />
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            ) : recData?.weakest_skill ? (
                                <TemplateCard
                                    image={TemplateImg}
                                    tag={
                                        <>
                                            <img
                                                src={ChatIcon}
                                                width={14}
                                                alt="tag"
                                            />
                                            <span
                                                style={{
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {recData.weakest_skill}
                                            </span>
                                        </>
                                    }
                                    title={`Luyện tập kỹ năng ${
                                        recData.weakest_skill === 'reading'
                                            ? 'Đọc (Reading)'
                                            : recData.weakest_skill ===
                                                'listening'
                                              ? 'Nghe (Listening)'
                                              : recData.weakest_skill ===
                                                  'writing'
                                                ? 'Viết (Writing)'
                                                : 'Nói (Speaking)'
                                    }`}
                                    excerpt={`AI phát hiện kỹ năng ${
                                        recData.weakest_skill === 'reading'
                                            ? 'Đọc'
                                            : recData.weakest_skill ===
                                                'listening'
                                              ? 'Nghe'
                                              : recData.weakest_skill ===
                                                  'writing'
                                                ? 'Viết'
                                                : 'Nói'
                                    } của bạn đang yếu nhất. Hãy luyện tập để cải thiện.`}
                                    ctaText="Luyện tập ngay"
                                    ctaIcon={
                                        <img
                                            src={YoutubeIcon}
                                            width={14}
                                            alt="cta"
                                        />
                                    }
                                />
                            ) : (
                                <TemplateCard
                                    image={TemplateImg}
                                    tag={
                                        <>
                                            <img
                                                src={ChatIcon}
                                                width={14}
                                                alt="tag"
                                            />
                                            <span>Luyện tập</span>
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
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
