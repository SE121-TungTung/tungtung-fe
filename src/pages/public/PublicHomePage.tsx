import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    publicApi,
    type PublicCourse,
    type PublicClass,
    type PublicLeadPayload,
} from '@/lib/public'
import { useDialog } from '@/hooks/useDialog'
import ChatbotWidget from '@/components/feature/chatbot/ChatbotWidget'
import { useReveal } from '@/hooks/useReveal'
import s from './PublicHomePage.module.css'
import { Helmet } from 'react-helmet-async'

// Custom component for scroll reveal block
const RevealBlock = ({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) => {
    const { ref, isVisible } = useReveal()
    return (
        <div
            ref={ref}
            className={`${className} ${s.reveal} ${isVisible ? s.revealVisible : ''}`}
        >
            {children}
        </div>
    )
}

// Custom component for tagline word-by-word reveal
const TaglineReveal = ({ text }: { text: string }) => {
    const { ref, isVisible } = useReveal(0.5)
    const words = text.split(' ')
    return (
        <div ref={ref} className={s.taglineText}>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={`${s.taglineWord} ${isVisible ? s.taglineWordVisible : ''}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                >
                    {word}
                </span>
            ))}
        </div>
    )
}

export default function PublicHomePage() {
    const navigate = useNavigate()
    const { alert } = useDialog()

    const [courses, setCourses] = useState<PublicCourse[]>([])
    const [classes, setClasses] = useState<PublicClass[]>([])

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
        const fetchData = async () => {
            try {
                const [coursesData, classesData] = await Promise.all([
                    publicApi.getCourses(),
                    publicApi.getClasses(),
                ])
                setCourses(coursesData)
                setClasses(classesData)
            } catch (error) {
                console.error('Failed to load public data', error)
            }
        }
        fetchData()
    }, [])

    const formatLevel = (level: string) => {
        const map: Record<string, string> = {
            beginner: 'Người mới bắt đầu',
            elementary: 'Sơ cấp',
            pre_intermediate: 'Tiền trung cấp',
            intermediate: 'Trung cấp',
            upper_intermediate: 'Trung cao cấp',
            advanced: 'Cao cấp',
            master: 'Chuyên gia',
        }
        return (
            map[level?.toLowerCase()] ||
            (level
                ? level.charAt(0).toUpperCase() +
                  level.slice(1).replace('_', ' ')
                : '')
        )
    }

    const validateForm = () => {
        const newErrors: Partial<Record<keyof PublicLeadPayload, string>> = {}
        if (!formData.full_name.trim())
            newErrors.full_name = 'Vui lòng nhập họ tên'

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
            newErrors.phone = 'Số điện thoại không hợp lệ'
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
                'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ lại sớm nhất!'
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

    return (
        <div className={s.container}>
            <Helmet>
                <title>TungTung - Lộ Trình Luyện Thi IELTS Cá Nhân Hóa</title>
                <meta
                    name="description"
                    content="Đạt mục tiêu IELTS nhanh chóng với lộ trình học cá nhân hóa và đội ngũ giáo viên giàu kinh nghiệm. Đăng ký tư vấn miễn phí ngay."
                />
            </Helmet>

            <header className={s.header}>
                <Link to="/" className={s.logo}>
                    TungTung
                </Link>
                <button
                    className={s.heroCta}
                    onClick={() => navigate('/login')}
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                >
                    Đăng nhập
                </button>
            </header>

            <main>
                <RevealBlock className={s.hero}>
                    <div className={s.heroContent}>
                        <h1 className={s.heroTitle}>
                            Đạt mục tiêu IELTS mà không học vẹt.
                        </h1>
                        <p className={s.heroSubtitle}>
                            Chương trình chuẩn quốc tế kết hợp lộ trình cá nhân
                            hóa giúp bạn tăng band điểm bền vững chỉ sau một
                            khóa học.
                        </p>
                        <a href="#consultation" className={s.heroCta}>
                            Nhận lộ trình miễn phí
                        </a>
                        <p className={s.proofLine}>
                            Hàng ngàn học viên đã đạt mục tiêu 7.0+
                        </p>
                    </div>
                </RevealBlock>

                <section className={s.taglineSection}>
                    <TaglineReveal text="Nắm vững phương pháp cốt lõi, chinh phục mọi dạng đề IELTS tự tin và chủ động." />
                </section>

                <RevealBlock className={s.section}>
                    <h2 className={s.sectionHeading}>Tại sao chọn TungTung?</h2>
                    <div className={s.grid3}>
                        <div className={s.card}>
                            <div className={s.cardIcon}>⏱</div>
                            <h3 className={s.cardTitle}>Tiết kiệm thời gian</h3>
                            <p className={s.cardDesc}>
                                Lộ trình được cá nhân hóa loại bỏ kiến thức
                                thừa, giúp bạn tập trung vào những kỹ năng cần
                                cải thiện nhất.
                            </p>
                        </div>
                        <div className={s.card}>
                            <div className={s.cardIcon}>🎯</div>
                            <h3 className={s.cardTitle}>Hiểu sâu bản chất</h3>
                            <p className={s.cardDesc}>
                                Không học vẹt, không mẹo vặt tạm thời. Nắm bắt
                                phương pháp cốt lõi để vận dụng linh hoạt vào kỳ
                                thi.
                            </p>
                        </div>
                        <div className={s.card}>
                            <div className={s.cardIcon}>🤝</div>
                            <h3 className={s.cardTitle}>Hỗ trợ trọn đời</h3>
                            <p className={s.cardDesc}>
                                Giáo viên đồng hành sát sao cùng bạn ngay cả sau
                                khi kết thúc khóa học để đảm bảo bạn đạt mục
                                tiêu.
                            </p>
                        </div>
                    </div>
                </RevealBlock>

                <RevealBlock className={s.section}>
                    <h2 className={s.sectionHeading}>3 bước bắt đầu dễ dàng</h2>
                    <div className={s.grid3}>
                        <div className={s.card}>
                            <div className={s.cardIcon}>1</div>
                            <h3 className={s.cardTitle}>Đánh giá năng lực</h3>
                            <p className={s.cardDesc}>
                                Làm bài test chuẩn hóa miễn phí để xác định
                                chính xác điểm yếu và trình độ hiện tại của bạn.
                            </p>
                        </div>
                        <div className={s.card}>
                            <div className={s.cardIcon}>2</div>
                            <h3 className={s.cardTitle}>Nhận lộ trình</h3>
                            <p className={s.cardDesc}>
                                Chuyên gia phân tích và thiết kế lộ trình riêng
                                biệt phù hợp với xuất phát điểm và mục tiêu.
                            </p>
                        </div>
                        <div className={s.card}>
                            <div className={s.cardIcon}>3</div>
                            <h3 className={s.cardTitle}>Chinh phục mục tiêu</h3>
                            <p className={s.cardDesc}>
                                Tham gia các lớp học tương tác cao và theo dõi
                                sự tiến bộ liên tục qua từng tuần học.
                            </p>
                        </div>
                    </div>
                </RevealBlock>

                <RevealBlock className={s.section}>
                    <h2 className={s.sectionHeading}>Các khóa học nổi bật</h2>
                    <div className={s.grid3}>
                        {courses.map((course) => (
                            <div key={course.id} className={s.card}>
                                <div className={s.cardIcon}>🎓</div>
                                <h3 className={s.cardTitle}>{course.name}</h3>
                                <p className={s.cardDesc}>
                                    {course.description}
                                </p>
                                <p className={s.proofLine}>
                                    Mức độ: {formatLevel(course.level)} •{' '}
                                    {course.duration_hours} giờ
                                </p>
                            </div>
                        ))}
                    </div>
                </RevealBlock>

                <RevealBlock className={s.section}>
                    <h2 className={s.sectionHeading}>Câu hỏi thường gặp</h2>
                    <div className={s.faqList}>
                        <div className={s.faqItem}>
                            <h4 className={s.faqQuestion}>
                                Khóa học kéo dài trong bao lâu?
                            </h4>
                            <p className={s.faqAnswer}>
                                Tùy thuộc vào xuất phát điểm và mục tiêu của
                                bạn, một khóa học thường kéo dài từ 2 đến 4
                                tháng.
                            </p>
                        </div>
                        <div className={s.faqItem}>
                            <h4 className={s.faqQuestion}>
                                Tôi có được đổi lịch học nếu bận không?
                            </h4>
                            <p className={s.faqAnswer}>
                                Có. Bạn có thể linh hoạt bảo lưu hoặc chuyển lớp
                                theo chính sách hỗ trợ học viên của trung tâm.
                            </p>
                        </div>
                        <div className={s.faqItem}>
                            <h4 className={s.faqQuestion}>
                                Trung tâm có cam kết đầu ra không?
                            </h4>
                            <p className={s.faqAnswer}>
                                Chúng tôi có văn bản cam kết đầu ra rõ ràng nếu
                                bạn tuân thủ đúng lộ trình và thời lượng học
                                được đề xuất.
                            </p>
                        </div>
                    </div>
                </RevealBlock>

                <RevealBlock className={s.section} id="consultation">
                    <div className={s.formContainer}>
                        <h2 className={s.sectionHeading}>
                            Bắt đầu lộ trình của bạn
                        </h2>
                        <p
                            className={s.heroSubtitle}
                            style={{ textAlign: 'center', maxWidth: '480px' }}
                        >
                            Để lại thông tin và chúng tôi sẽ liên hệ để tư vấn
                            lộ trình phù hợp nhất cho bạn.
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            className={s.form}
                            noValidate
                        >
                            <div className={s.formGroup}>
                                <label className={s.label}>Họ và tên</label>
                                <input
                                    className={s.input}
                                    type="text"
                                    placeholder="Nguyễn Văn A"
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
                            <div className={s.formGroup}>
                                <label className={s.label}>Email</label>
                                <input
                                    className={s.input}
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
                                <label className={s.label}>Số điện thoại</label>
                                <input
                                    className={s.input}
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
                            <div className={s.formGroup}>
                                <label className={s.label}>
                                    Mục tiêu điểm số (Target Band)
                                </label>
                                <input
                                    className={s.input}
                                    type="text"
                                    placeholder="Ví dụ: 6.5, 7.0"
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
                                className={s.heroCta}
                                style={{ width: '100%', marginTop: '16px' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Đang gửi...'
                                    : 'Nhận tư vấn ngay'}
                            </button>
                        </form>
                    </div>
                </RevealBlock>
            </main>
            <ChatbotWidget />
        </div>
    )
}
