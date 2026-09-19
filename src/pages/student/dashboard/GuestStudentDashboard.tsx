import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { testApi } from '@/lib/test'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './Dashboard.module.css' // Reuse student dashboard styles
import DualHookModal from '@/components/feature/exams/shared/DualHookModal'

export default function GuestStudentDashboard() {
    const navigate = useNavigate()
    const [showRegisterModal, setShowRegisterModal] = useState(false)

    // Load recent attempts for the guest_student
    const { data: attemptsData, isLoading } = useQuery({
        queryKey: ['my_attempts', 'guest_student'],
        queryFn: () => testApi.getMyAttempts({ limit: 5 }),
    })

    const sampleRoadmap = [
        { title: 'Kiểm tra trình độ đầu vào', status: 'done' },
        {
            title: 'Xây dựng nền tảng từ vựng & ngữ pháp (Target 4.0)',
            status: 'locked',
        },
        { title: 'Luyện kỹ năng cơ bản (Target 5.0)', status: 'locked' },
        {
            title: 'Phát triển chiến thuật làm bài (Target 6.0)',
            status: 'locked',
        },
        { title: 'Luyện đề chuyên sâu (Target 7.0+)', status: 'locked' },
    ]

    return (
        <div className={s.dashboardWrapper}>
            <header className={s.header}>
                <h1 className={s.welcomeText}>
                    Xin chào, Học viên trải nghiệm! 👋
                </h1>
                <p className={s.subtitle}>
                    Khám phá lộ trình học IELTS dành riêng cho bạn
                </p>
            </header>

            <div className={s.mainGrid}>
                {/* Left Column */}
                <div className={s.leftColumn}>
                    {/* Roadmap Card */}
                    <Card variant="outline" title="Lộ trình học đề xuất">
                        <div className={s.roadmapContainer}>
                            <p className={s.roadmapDesc}>
                                Đây là lộ trình mẫu dựa trên các bài thi thử bạn
                                đã tham gia. Đăng ký để mở khóa toàn bộ lộ trình
                                và bắt đầu học!
                            </p>
                            <ul
                                className={s.roadmapList}
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    marginTop: '1rem',
                                }}
                            >
                                {sampleRoadmap.map((item, idx) => (
                                    <li
                                        key={idx}
                                        style={{
                                            padding: '0.75rem 0',
                                            borderBottom: '1px solid #e5e7eb',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color:
                                                    item.status === 'locked'
                                                        ? '#9ca3af'
                                                        : '#111827',
                                            }}
                                        >
                                            {item.title}
                                        </span>
                                        {item.status === 'done' ? (
                                            <span
                                                style={{
                                                    color: '#16a34a',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                ✓ Đã hoàn thành
                                            </span>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>
                                                🔒 Bị khóa
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    textAlign: 'center',
                                }}
                            >
                                <ButtonPrimary
                                    onClick={() => setShowRegisterModal(true)}
                                >
                                    Đăng ký học chính thức
                                </ButtonPrimary>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className={s.rightColumn}>
                    {/* Test History Card */}
                    <Card
                        variant="outline"
                        title="Lịch sử bài thi thử"
                        action={
                            <ButtonGhost
                                onClick={() => navigate('/public/tests')}
                            >
                                Thi thử tiếp
                            </ButtonGhost>
                        }
                    >
                        {isLoading ? (
                            <p>Đang tải...</p>
                        ) : (
                            <div className={s.classList}>
                                {attemptsData?.items.length === 0 ? (
                                    <p className={s.emptyState}>
                                        Chưa có bài thi nào.
                                    </p>
                                ) : (
                                    attemptsData?.items.map((attempt) => (
                                        <div
                                            key={attempt.id}
                                            className={s.classItem}
                                            onClick={() =>
                                                navigate(
                                                    `/public/tests/results/${attempt.id}`
                                                )
                                            }
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div>
                                                <h4 className={s.className}>
                                                    {attempt.testTitle}
                                                </h4>
                                                <p className={s.classInfo}>
                                                    Điểm:{' '}
                                                    {attempt.totalScore
                                                        ? attempt.totalScore.toFixed(
                                                              1
                                                          )
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className={s.statusBadge}>
                                                {attempt.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            {showRegisterModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            maxWidth: '400px',
                            textAlign: 'center',
                        }}
                    >
                        <h3>Liên hệ ghi danh</h3>
                        <p style={{ margin: '1rem 0' }}>
                            Vui lòng liên hệ với trung tâm qua Fanpage hoặc
                            Hotline để đăng ký học chính thức và mở khóa lộ
                            trình cá nhân hóa.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonGhost
                                onClick={() => setShowRegisterModal(false)}
                            >
                                Đóng
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={() =>
                                    window.open(
                                        'https://m.me/tungtung',
                                        '_blank'
                                    )
                                }
                            >
                                Chat với tư vấn viên
                            </ButtonPrimary>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
