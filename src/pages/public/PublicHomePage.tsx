import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    publicApi,
    type PublicCourse,
    type PublicClass,
    type PublicLeadPayload,
} from '@/lib/public'
import { useDialog } from '@/hooks/useDialog'
import { useUIStore } from '@/stores/ui.store'
import ChatbotWidget from '@/components/feature/chatbot/ChatbotWidget'
import { useReveal } from '@/hooks/useReveal'
import EducationalBackground from '@/components/effect/EducationalBackground'
import ClickSpark from '@/components/effect/ClickSpark'
import StrokeText from '@/components/effect/StrokeText'
import BorderGlow from '@/components/effect/BorderGlow'
import s from './PublicHomePage.module.css'
import { Helmet } from 'react-helmet-async'
import PublicHeader from './PublicHeader'

// Custom component for scroll reveal block
const RevealBlock = ({
    children,
    className = '',
    id,
}: {
    children: React.ReactNode
    className?: string
    id?: string
}) => {
    const { ref, isVisible } = useReveal()
    return (
        <div
            id={id}
            ref={ref}
            className={`${className} ${s.reveal} ${isVisible ? s.revealVisible : ''}`}
        >
            {children}
        </div>
    )
}

// Custom component for tagline word-by-word reveal
const TaglineReveal = ({ text }: { text: string }) => {
    const { ref, isVisible } = useReveal(0.4)
    const words = text.split(' ')
    return (
        <div ref={ref} className={s.taglineText}>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={`${s.taglineWord} ${isVisible ? s.taglineWordVisible : ''}`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                >
                    {word}
                </span>
            ))}
        </div>
    )
}

// Chevron icon for accordion
const ChevronDownIcon = ({ open }: { open: boolean }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const SparkleBadgeIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
)

const DEFAULT_COURSES: PublicCourse[] = [
    {
        id: '1',
        name: 'IELTS Foundation (3.5 - 5.0)',
        description:
            'Xây dựng nền tảng ngữ pháp, phát âm và từ vựng cốt lõi chuẩn Cambridge cho người mới bắt đầu.',
        level: 'elementary',
        course_type: 'standard',
        duration_hours: 48,
        fee_amount: 0,
        currency: 'VND',
    },
    {
        id: '2',
        name: 'IELTS Breakthrough (5.0 - 6.5)',
        description:
            'Chiến thuật xử lý trọn vẹn 4 kỹ năng Listening, Reading, Speaking và Writing với kho đề thi thử sát thực tế.',
        level: 'intermediate',
        course_type: 'standard',
        duration_hours: 72,
        fee_amount: 0,
        currency: 'VND',
    },
    {
        id: '3',
        name: 'IELTS Master (6.5 - 7.5+)',
        description:
            'Chuyên sâu tư duy phản biện cao cấp, tối ưu hóa từ vựng C1-C2 và chuẩn hóa phát âm cùng cựu giám khảo.',
        level: 'advanced',
        course_type: 'standard',
        duration_hours: 60,
        fee_amount: 0,
        currency: 'VND',
    },
]

export default function PublicHomePage() {
    const navigate = useNavigate()
    const { alert } = useDialog()
    const { theme } = useUIStore()
    const isDark = theme === 'dark'

    const [courses, setCourses] = useState<PublicCourse[]>([])
    const [, setClasses] = useState<PublicClass[]>([])
    const [openFaq, setOpenFaq] = useState<number | null>(0)
    const [showBackToTop, setShowBackToTop] = useState(false)

    const [formData, setFormData] = useState<PublicLeadPayload>({
        full_name: '',
        email: '',
        phone: '',
        target_band: '',
        intent: '',
    })
    const [errors, setErrors] = useState<
        Partial<Record<keyof PublicLeadPayload, string>>
    >({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 350)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, classesData] = await Promise.all([
                    publicApi.getCourses(),
                    publicApi.getClasses(),
                ])
                if (coursesData && coursesData.length > 0) {
                    setCourses(coursesData)
                } else {
                    setCourses(DEFAULT_COURSES)
                }
                setClasses(classesData || [])
            } catch (error) {
                console.error('Failed to load public data', error)
                setCourses(DEFAULT_COURSES)
            }
        }
        fetchData()
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatLevel = (level: string) => {
        const map: Record<string, string> = {
            beginner: 'Người mới bắt đầu',
            elementary: 'Sơ cấp (3.5 - 4.5)',
            pre_intermediate: 'Tiền trung cấp',
            intermediate: 'Trung cấp (5.0 - 6.5)',
            upper_intermediate: 'Trung cao cấp',
            advanced: 'Cao cấp (6.5 - 7.5+)',
            master: 'Chuyên gia (8.0+)',
        }
        return (
            map[level?.toLowerCase()] ||
            (level
                ? level.charAt(0).toUpperCase() +
                  level.slice(1).replace('_', ' ')
                : 'Mọi trình độ')
        )
    }

    const validateForm = () => {
        const newErrors: Partial<Record<keyof PublicLeadPayload, string>> = {}
        if (!formData.full_name.trim())
            newErrors.full_name = 'Vui lòng nhập họ tên của bạn'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ'
        }

        const phoneRegex = /^0\d{9}$/
        if (!formData.phone) {
            newErrors.phone = 'Vui lòng nhập số điện thoại'
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại gồm 10 chữ số (bắt đầu bằng 0)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            await publicApi.submitLead(formData)
            await alert(
                'Cảm ơn bạn đã quan tâm! Đội ngũ tư vấn của TungTung sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ làm việc.'
            )
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                target_band: '',
                intent: '',
            })
        } catch (error: any) {
            console.error('Failed to submit lead', error)
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra, vui lòng thử lại sau.'
            await alert(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    const displayedCourses = courses.length > 0 ? courses : DEFAULT_COURSES

    const faqs = [
        {
            q: 'Khóa học tại TungTung kéo dài trong bao lâu?',
            a: 'Tùy thuộc vào trình độ xuất phát và mục tiêu cá nhân của bạn, mỗi khóa học chuẩn kéo dài từ 2 đến 3 tháng. Lộ trình được thiết kế cô đọng, tập trung khắc phục điểm yếu để bạn đạt kết quả nhanh nhất.',
        },
        {
            q: 'Tôi có thể đổi lịch học hoặc học bù nếu bận việc đột xuất không?',
            a: 'Hoàn toàn có thể. TungTung hỗ trợ linh hoạt bảo lưu khóa học, học bù tại các lớp song song và xem lại toàn bộ bản ghi video bài giảng tương tác trên hệ thống quản lý học tập.',
        },
        {
            q: 'Trung tâm có cam kết văn bản đầu ra hay không?',
            a: 'Có. Tất cả học viên tuân thủ đầy đủ số buổi học và hoàn thành các bài tập trọng tâm theo hướng dẫn sẽ được ký cam kết đầu ra bằng văn bản. Trường hợp chưa đạt band điểm kỳ vọng, học viên được học lại hoàn toàn miễn phí.',
        },
        {
            q: 'Bài thi thử trực tuyến tại TungTung có sát với đề thi thật không?',
            a: 'Hệ thống bài thi thử được thiết kế dựa trên cấu trúc đề thi chính thức mới nhất của Cambridge và IDP, tích hợp công nghệ AI chấm chữa tức thì và phân tích chi tiết từng tiêu chí chấm thi.',
        },
    ]

    return (
        <ClickSpark
            sparkColor={isDark ? '#38bdf8' : '#ef325f'}
            sparkSize={14}
            sparkRadius={22}
            sparkCount={9}
            duration={420}
        >
            <div className={s.container}>
                <Helmet>
                    <title>
                        TungTung - Lộ Trình Luyện Thi IELTS Cá Nhân Hóa Chuẩn
                        Quốc Tế
                    </title>
                    <meta
                        name="description"
                        content="Đạt mục tiêu IELTS nhanh chóng với lộ trình học cá nhân hóa kết hợp trí tuệ nhân tạo và đội ngũ giảng viên 8.5+. Đăng ký tư vấn miễn phí ngay."
                    />
                </Helmet>

                {/* Atmospheric Background Layer (Shared with /login AuthLayout) */}
                <div className={s.background} aria-hidden="true">
                    <EducationalBackground />
                </div>

                {/* Glassmorphic Fixed Header */}
                <PublicHeader />

                <main className={s.mainContent}>
                    {/* Hero Section */}
                    <RevealBlock className={s.hero} id="hero">
                        <div className={s.heroPill}>
                            <span className={s.heroPillIcon}>
                                <SparkleBadgeIcon />
                            </span>
                            <span className={s.heroPillText}>
                                Giải pháp luyện thi IELTS chuẩn quốc tế thế hệ
                                mới
                            </span>
                        </div>

                        <div className={s.heroContent}>
                            {/* Title with React Bits StrokeText Effect */}
                            <div className={s.heroTitleWrapper}>
                                <StrokeText
                                    text="Đạt mục tiêu IELTS mà không học vẹt."
                                    fontSize={64}
                                    fontWeight={800}
                                    strokeColor={isDark ? '#f43f5e' : '#d62839'}
                                    gradient={
                                        isDark
                                            ? { from: '#fb7185', to: '#38bdf8' }
                                            : { from: '#d62839', to: '#175676' }
                                    }
                                    strokeWidth={1.8}
                                    drawDuration={1.8}
                                    fillDelay={0.2}
                                    trigger="mount"
                                    fillMode="wipe"
                                    letterSpacing={-1.2}
                                    className={s.heroStrokeTitle}
                                />
                            </div>

                            <p className={s.heroSubtitle}>
                                Chương trình chuẩn quốc tế kết hợp lộ trình cá
                                nhân hóa giúp bạn bứt phá band điểm bền vững chỉ
                                sau một khóa học.
                            </p>

                            <div className={s.heroCtaGroup}>
                                <a
                                    href="#consultation"
                                    className={s.heroCtaPrimary}
                                >
                                    <span>Nhận lộ trình miễn phí</span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => navigate('/public/tests')}
                                    className={s.heroCtaGlass}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    <span>Thi thử trực tuyến</span>
                                </button>
                            </div>

                            {/* Floating Glass Stats / Social Proof Row */}
                            <div className={s.proofRow}>
                                <div className={s.proofBadge}>
                                    <span className={s.proofDot} />
                                    <span>
                                        <strong>4.9/5</strong> Đánh giá từ học
                                        viên
                                    </span>
                                </div>
                                <div className={s.proofBadge}>
                                    <span className={s.proofDot} />
                                    <span>
                                        <strong>92%</strong> Đạt và vượt band
                                        mục tiêu
                                    </span>
                                </div>
                                <div className={s.proofBadge}>
                                    <span className={s.proofDot} />
                                    <span>
                                        <strong>10,000+</strong> Học viên đồng
                                        hành
                                    </span>
                                </div>
                            </div>
                        </div>
                    </RevealBlock>

                    {/* Tagline Section with Glass Showcase Box */}
                    <section className={s.taglineSection}>
                        <div className={s.taglineGlassCard}>
                            <TaglineReveal text="Nắm vững phương pháp cốt lõi, chinh phục mọi dạng đề IELTS tự tin và chủ động." />
                        </div>
                    </section>

                    {/* Benefits Section: Tại sao chọn TungTung */}
                    <RevealBlock className={s.section} id="features">
                        <div className={s.sectionHeader}>
                            <span className={s.sectionEyebrow}>
                                Ưu điểm vượt trội
                            </span>
                            <h2 className={s.sectionHeading}>
                                Tại sao chọn TungTung?
                            </h2>
                            <p className={s.sectionSubtitle}>
                                Hệ sinh thái học tập toàn diện được thiết kế
                                giúp bạn tối ưu hóa từng giờ học.
                            </p>
                        </div>

                        <div className={s.grid3}>
                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.cardInner}>
                                    <div
                                        className={`${s.cardIcon} ${s.iconCyan}`}
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <h3 className={s.cardTitle}>
                                        Tiết kiệm 50% thời gian
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Lộ trình cá nhân hóa chuẩn xác loại bỏ
                                        hoàn toàn kiến thức dàn trải, tập trung
                                        đúng vào kỹ năng bạn còn thiếu.
                                    </p>
                                    <div className={s.cardFooterMeta}>
                                        <span>Lộ trình thông minh</span>
                                    </div>
                                </div>
                            </BorderGlow>

                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.cardInner}>
                                    <div
                                        className={`${s.cardIcon} ${s.iconLapis}`}
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                        </svg>
                                    </div>
                                    <h3 className={s.cardTitle}>
                                        Hiểu sâu bản chất ngôn ngữ
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Không học tủ, không phụ thuộc mẹo vặt
                                        tạm thời. Nắm vững tư duy logic và kỹ
                                        năng học thuật để tự tin trước mọi đề
                                        thi.
                                    </p>
                                    <div className={s.cardFooterMeta}>
                                        <span>Chuẩn Cambridge</span>
                                    </div>
                                </div>
                            </BorderGlow>

                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.cardInner}>
                                    <div
                                        className={`${s.cardIcon} ${s.iconRose}`}
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <h3 className={s.cardTitle}>
                                        Đồng hành & Chăm sóc 1-1
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Đội ngũ giảng viên 8.5+ cùng cố vấn học
                                        tập theo sát bạn hàng tuần, giải đáp
                                        thắc mắc và sửa bài chi tiết 24/7.
                                    </p>
                                    <div className={s.cardFooterMeta}>
                                        <span>Hỗ trợ trọn đời</span>
                                    </div>
                                </div>
                            </BorderGlow>
                        </div>
                    </RevealBlock>

                    {/* 3 Steps Section */}
                    <RevealBlock className={s.section} id="steps">
                        <div className={s.sectionHeader}>
                            <span className={s.sectionEyebrow}>
                                Quy trình đơn giản
                            </span>
                            <h2 className={s.sectionHeading}>
                                3 bước bắt đầu dễ dàng
                            </h2>
                            <p className={s.sectionSubtitle}>
                                Bắt đầu hành trình chinh phục IELTS với các bước
                                rõ ràng và minh bạch.
                            </p>
                        </div>

                        <div className={s.grid3}>
                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.stepCardInner}>
                                    <div className={s.stepNumberBadge}>01</div>
                                    <h3 className={s.cardTitle}>
                                        Đánh giá năng lực chuẩn xác
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Làm bài kiểm tra chuẩn hóa trực tuyến
                                        miễn phí để xác định rõ điểm mạnh, điểm
                                        yếu và band điểm thực tế.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate('/public/tests')
                                        }
                                        className={s.stepCtaBtn}
                                    >
                                        <span>Bắt đầu Test ngay</span>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </div>
                            </BorderGlow>

                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.stepCardInner}>
                                    <div className={s.stepNumberBadge}>02</div>
                                    <h3 className={s.cardTitle}>
                                        Nhận lộ trình cá nhân hóa
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Chuyên gia học thuật phân tích kết quả
                                        và xây dựng lộ trình học tập tối ưu theo
                                        quỹ thời gian của bạn.
                                    </p>
                                    <div className={s.stepHint}>
                                        ✦ Tư vấn miễn phí 1-1
                                    </div>
                                </div>
                            </BorderGlow>

                            <BorderGlow
                                className={s.cardGlowCard}
                                borderRadius={24}
                                edgeSensitivity={32}
                                glowColor={isDark ? '200 85 65' : '345 80 60'}
                                backgroundColor={
                                    isDark
                                        ? 'rgba(15, 23, 42, 0.72)'
                                        : 'rgba(255, 255, 255, 0.72)'
                                }
                                colors={
                                    isDark
                                        ? ['#38bdf8', '#fb7185', '#818cf8']
                                        : ['#d62839', '#ef325f', '#175676']
                                }
                                glowRadius={36}
                                glowIntensity={1.15}
                            >
                                <div className={s.stepCardInner}>
                                    <div className={s.stepNumberBadge}>03</div>
                                    <h3 className={s.cardTitle}>
                                        Bứt phá mục tiêu IELTS
                                    </h3>
                                    <p className={s.cardDesc}>
                                        Tham gia các lớp học tương tác trực
                                        tiếp, làm bài tập thực hành trên nền
                                        tảng và nhận kết quả vượt kỳ vọng.
                                    </p>
                                    <div className={s.stepHint}>
                                        ✦ Cam kết đầu ra bằng văn bản
                                    </div>
                                </div>
                            </BorderGlow>
                        </div>
                    </RevealBlock>

                    {/* Featured Courses Section */}
                    <RevealBlock className={s.section} id="courses">
                        <div className={s.sectionHeader}>
                            <span className={s.sectionEyebrow}>
                                Chương trình đào tạo
                            </span>
                            <h2 className={s.sectionHeading}>
                                Các khóa học nổi bật
                            </h2>
                            <p className={s.sectionSubtitle}>
                                Thiết kế chuẩn hóa theo chuẩn quốc tế, phù hợp
                                cho mọi mục tiêu từ cơ bản đến nâng cao.
                            </p>
                        </div>

                        <div className={s.grid3}>
                            {displayedCourses.map((course) => (
                                <BorderGlow
                                    key={course.id}
                                    className={s.cardGlowCard}
                                    borderRadius={24}
                                    edgeSensitivity={32}
                                    glowColor={
                                        isDark ? '200 85 65' : '345 80 60'
                                    }
                                    backgroundColor={
                                        isDark
                                            ? 'rgba(15, 23, 42, 0.72)'
                                            : 'rgba(255, 255, 255, 0.72)'
                                    }
                                    colors={
                                        isDark
                                            ? ['#38bdf8', '#fb7185', '#818cf8']
                                            : ['#d62839', '#ef325f', '#175676']
                                    }
                                    glowRadius={36}
                                    glowIntensity={1.15}
                                >
                                    <div className={s.courseCardInner}>
                                        <div className={s.courseCardHeader}>
                                            <span
                                                className={s.courseLevelBadge}
                                            >
                                                {formatLevel(course.level)}
                                            </span>
                                            <span className={s.courseDuration}>
                                                ⏱ {course.duration_hours} giờ
                                                học
                                            </span>
                                        </div>
                                        <h3 className={s.courseTitle}>
                                            {course.name}
                                        </h3>
                                        <p className={s.courseDesc}>
                                            {course.description}
                                        </p>
                                        <div className={s.courseCardFooter}>
                                            <a
                                                href="#consultation"
                                                className={s.courseActionBtn}
                                            >
                                                Đăng ký tư vấn
                                            </a>
                                        </div>
                                    </div>
                                </BorderGlow>
                            ))}
                        </div>
                    </RevealBlock>

                    {/* Interactive FAQ Section */}
                    <RevealBlock className={s.section} id="faq">
                        <div className={s.sectionHeader}>
                            <span className={s.sectionEyebrow}>
                                Giải đáp thắc mắc
                            </span>
                            <h2 className={s.sectionHeading}>
                                Câu hỏi thường gặp
                            </h2>
                            <p className={s.sectionSubtitle}>
                                Những thắc mắc phổ biến nhất từ học viên khi tìm
                                hiểu về TungTung.
                            </p>
                        </div>

                        <div className={s.faqList}>
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index
                                return (
                                    <div
                                        key={index}
                                        className={`${s.faqItem} ${isOpen ? s.faqItemOpen : ''}`}
                                        onClick={() => toggleFaq(index)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault()
                                                toggleFaq(index)
                                            }
                                        }}
                                    >
                                        <div className={s.faqQuestionRow}>
                                            <h4 className={s.faqQuestion}>
                                                {faq.q}
                                            </h4>
                                            <span className={s.faqToggleIcon}>
                                                <ChevronDownIcon
                                                    open={isOpen}
                                                />
                                            </span>
                                        </div>
                                        {isOpen && (
                                            <p className={s.faqAnswer}>
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </RevealBlock>

                    {/* Consultation Form Section (Glass Card ref from /login FormCard) */}
                    <RevealBlock className={s.section} id="consultation">
                        <div className={s.formWrapper}>
                            <div className={s.formContainer}>
                                <div className={s.formHeader}>
                                    <span className={s.formBadge}>
                                        ✦ Tư vấn miễn phí 100%
                                    </span>
                                    <h2 className={s.formTitle}>
                                        Bắt đầu lộ trình của bạn
                                    </h2>
                                    <p className={s.formSubtitle}>
                                        Để lại thông tin và chuyên gia học thuật
                                        của TungTung sẽ liên hệ thiết kế lộ
                                        trình phù hợp nhất cho bạn.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className={s.form}
                                    noValidate
                                >
                                    <div className={s.formGroup}>
                                        <label className={s.label}>
                                            Họ và tên *
                                        </label>
                                        <input
                                            className={`${s.input} ${errors.full_name ? s.inputError : ''}`}
                                            type="text"
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            value={formData.full_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    full_name: e.target.value,
                                                })
                                            }
                                        />
                                        {errors.full_name && (
                                            <span className={s.errorText}>
                                                {errors.full_name}
                                            </span>
                                        )}
                                    </div>

                                    <div className={s.formGrid2}>
                                        <div className={s.formGroup}>
                                            <label className={s.label}>
                                                Email *
                                            </label>
                                            <input
                                                className={`${s.input} ${errors.email ? s.inputError : ''}`}
                                                type="email"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                            {errors.email && (
                                                <span className={s.errorText}>
                                                    {errors.email}
                                                </span>
                                            )}
                                        </div>

                                        <div className={s.formGroup}>
                                            <label className={s.label}>
                                                Số điện thoại *
                                            </label>
                                            <input
                                                className={`${s.input} ${errors.phone ? s.inputError : ''}`}
                                                type="tel"
                                                placeholder="0912345678"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                            {errors.phone && (
                                                <span className={s.errorText}>
                                                    {errors.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={s.formGroup}>
                                        <label className={s.label}>
                                            Mục tiêu điểm số (Target Band)
                                        </label>
                                        <input
                                            className={s.input}
                                            type="text"
                                            placeholder="Ví dụ: 6.5, 7.0 hoặc Chưa xác định"
                                            value={formData.target_band}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    target_band: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={s.formSubmitBtn}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span>Đang gửi thông tin...</span>
                                        ) : (
                                            <>
                                                <span>
                                                    Nhận tư vấn lộ trình ngay
                                                </span>
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line
                                                        x1="5"
                                                        y1="12"
                                                        x2="19"
                                                        y2="12"
                                                    />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                    <p className={s.formDisclaimer}>
                                        TungTung cam kết bảo mật 100% thông tin
                                        cá nhân của bạn.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </RevealBlock>
                </main>

                {/* Glassmorphic Footer */}
                <footer className={s.footer}>
                    <div className={s.footerInner}>
                        <div className={s.footerBrandCol}>
                            <Link to="/" className={s.logoGroup}>
                                <span className={s.logoBadge}>
                                    <SparkleBadgeIcon />
                                </span>
                                <span className={s.logo}>TungTung</span>
                            </Link>
                            <p className={s.footerTagline}>
                                Hệ sinh thái luyện thi IELTS thông minh, cá nhân
                                hóa hàng đầu Việt Nam.
                            </p>
                        </div>

                        <div className={s.footerLinksCol}>
                            <h5 className={s.footerHeading}>Liên kết nhanh</h5>
                            <ul className={s.footerLinks}>
                                <li>
                                    <a href="#features">
                                        Tại sao chọn TungTung
                                    </a>
                                </li>
                                <li>
                                    <a href="#steps">Lộ trình học tập</a>
                                </li>
                                <li>
                                    <a href="#courses">Khóa học nổi bật</a>
                                </li>
                                <li>
                                    <a href="#faq">Câu hỏi thường gặp</a>
                                </li>
                            </ul>
                        </div>

                        <div className={s.footerLinksCol}>
                            <h5 className={s.footerHeading}>
                                Công cụ học viên
                            </h5>
                            <ul className={s.footerLinks}>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate('/public/tests')
                                        }
                                        className={s.footerActionLink}
                                    >
                                        Thi thử IELTS online
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className={s.footerActionLink}
                                    >
                                        Đăng nhập tài khoản
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={s.footerBottom}>
                        <p>
                            © 2026 TungTung Educational Platform. Tất cả các
                            quyền được bảo lưu.
                        </p>
                    </div>
                </footer>

                {/* Back to top floating glass button */}
                {showBackToTop && (
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className={s.backToTopBtn}
                        aria-label="Lên đầu trang"
                        title="Lên đầu trang"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                    </button>
                )}

                {/* Existing Chatbot Widget */}
                <ChatbotWidget />
            </div>
        </ClickSpark>
    )
}
