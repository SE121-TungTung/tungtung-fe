import React from 'react'
import s from './TeacherDashboard.module.css'
import { useQuery } from '@tanstack/react-query'

import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import TemplateCard from '@/components/common/card/TemplateCard'

import ChartBarIcon from '@/assets/Chart Bar.svg'
import ChatIcon from '@/assets/Chat Square Double Text.svg'
import DocumentIcon from '@/assets/Attachment 2.svg'
import ArrowRightIcon from '@/assets/Arrow Right.svg'
import BannerImg from '@/assets/banner-placeholder.png'

import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'
import { getMe, getUserOverview } from '@/lib/users' // Thêm getUserOverview
import type { TeacherOverviewStats } from '@/types/user.types'
import Skeleton from '@/components/effect/Skeleton'

export default function TeacherDashboard() {
    // 1. Lấy thông tin User
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    // 2. Lấy thông tin Overview thực tế từ API
    const { data: overviewData, isLoading: statsLoading } = useQuery({
        queryKey: ['user-overview'],
        queryFn: () => getUserOverview<TeacherOverviewStats>(),
    })

    const greetingTexts = userData
        ? [
              `Xin chào thầy/cô ${userData.firstName} ${userData.lastName}!`,
              `Chúc thầy/cô một ngày giảng dạy hiệu quả!`,
          ]
        : ['Xin chào!', 'Chúc bạn một ngày làm việc hiệu quả!']

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    // 3. Map dữ liệu từ API vào format của StatCard
    const dynamicStats = [
        {
            id: 'active_classes',
            title: 'Lớp phụ trách',
            value: overviewData?.active_classes?.toString() || '0',
            unit: '',
            subtitle: 'Số lớp đang hoạt động bạn đang đứng lớp',
            active: true,
        },
        {
            id: 'total_students',
            title: 'Tổng số học viên',
            value: overviewData?.total_students?.toString() || '0',
            unit: '',
            subtitle: 'Tổng số học sinh trong các lớp bạn phụ trách',
        },
        {
            id: 'sessions_today',
            title: 'Buổi dạy hôm nay',
            value: overviewData?.sessions_today?.toString() || '0',
            unit: '',
            subtitle: 'Lịch dạy dự kiến trong ngày hôm nay',
        },
        {
            id: 'pending_grading',
            title: 'Bài chờ chấm',
            value: overviewData?.pending_grading_count?.toString() || '0',
            unit: '',
            subtitle: 'Số lượng bài thi học sinh đã nộp cần bạn chấm điểm',
        },
    ]

    return (
        <div className={s.dashboard}>
            <h1 className={s.welcomeMessage}>
                {userLoading ? (
                    <Skeleton
                        width="60%"
                        height="3rem"
                        style={{ margin: '0 auto' }}
                    />
                ) : (
                    !userLoading &&
                    userData && (
                        <TextType
                            text={greetingTexts}
                            typingSpeed={60}
                            pauseDuration={4000}
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
                    )
                )}
            </h1>

            <main className={s.mainContent}>
                <Card
                    title="Tổng quan giảng dạy"
                    subtitle="Số liệu thực tế từ hệ thống quản lý"
                    direction="horizontal"
                >
                    <div className={s.statsGrid}>
                        {statsLoading ? (
                            <Skeleton height={140} variant="rect" count={4} />
                        ) : (
                            dynamicStats.map((stat) => (
                                <StatCard
                                    key={stat.id}
                                    title={stat.title}
                                    value={stat.value}
                                    unit={stat.unit}
                                    subtitle={stat.subtitle}
                                    active={stat.active}
                                    icon={
                                        <img
                                            src={ChartBarIcon}
                                            alt="stat icon"
                                        />
                                    }
                                />
                            ))
                        )}
                    </div>
                </Card>

                <div className={s.mainRow}>
                    {/* Giữ nguyên các phần khác hoặc tích hợp API lịch dạy nếu cần */}
                    <ScheduleTodayCard
                        title="Lịch dạy hôm nay"
                        sessions={[]} // Ở đây nên fetch thêm API list sessions thực tế
                        onCheckIn={() => alert('Đã xác nhận giảng dạy!')}
                    />

                    <Card
                        title="Trợ lý giảng dạy AI"
                        subtitle="Hỗ trợ soạn giáo án và đánh giá học viên"
                    >
                        <div className={s.suggestionBody}>
                            <div className={s.suggestionTip}>
                                {statsLoading ? (
                                    <div style={{ width: '100%' }}>
                                        <Skeleton
                                            height={20}
                                            width="40%"
                                            style={{ marginBottom: '10px' }}
                                        />
                                        <Skeleton height={60} variant="rect" />
                                    </div>
                                ) : (
                                    <TextHorizontal
                                        icon={
                                            <img src={ChatIcon} alt="ai tip" />
                                        }
                                        iconStyle="flat"
                                        title="Gợi ý chấm bài"
                                        description={
                                            overviewData?.pending_grading_count
                                                ? `Bạn đang có ${overviewData.pending_grading_count} bài cần chấm. Hãy sử dụng AI để hỗ trợ!`
                                                : 'Hiện không có bài nộp mới cần chấm điểm.'
                                        }
                                        mode="light"
                                    />
                                )}
                            </div>

                            <TemplateCard
                                image={BannerImg}
                                tag={
                                    <>
                                        <img
                                            src={DocumentIcon}
                                            width={14}
                                            alt="doc icon"
                                        />
                                        <span>Lesson Plan</span>
                                    </>
                                }
                                title="Soạn giáo án tự động"
                                excerpt="Sử dụng AI để tạo khung giáo án chi tiết cho buổi học sắp tới dựa trên tiến độ lớp."
                                ctaText="Tạo ngay"
                                ctaIcon={
                                    <img
                                        src={ArrowRightIcon}
                                        width={14}
                                        alt="arrow icon"
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
