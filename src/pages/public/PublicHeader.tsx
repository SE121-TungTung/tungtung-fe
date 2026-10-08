import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip } from '@/components/core/Tooltip'
import s from './PublicHomePage.module.css'

const SunIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)

const MoonIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const SparkleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
)

export default function PublicHeader() {
    const navigate = useNavigate()
    const { theme, setTheme } = useUIStore()
    const isDark = theme === 'dark'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark')
    }

    const scrollTo = (id: string) => {
        setMobileMenuOpen(false)
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <header className={`${s.headerWrapper} ${scrolled ? s.scrolled : ''}`}>
            <div className={s.header}>
                {/* Brand Logo */}
                <Link to="/" className={s.logoGroup}>
                    <span className={s.logoBadge}>
                        <SparkleIcon />
                    </span>
                    <span className={s.logo}>TungTung</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className={s.navLinks} aria-label="Main Navigation">
                    <button
                        type="button"
                        onClick={() => scrollTo('features')}
                        className={s.navLink}
                    >
                        Tại sao chọn TungTung
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('steps')}
                        className={s.navLink}
                    >
                        Lộ trình 3 bước
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('courses')}
                        className={s.navLink}
                    >
                        Khóa học
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('faq')}
                        className={s.navLink}
                    >
                        Hỏi đáp
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('consultation')}
                        className={s.navLink}
                    >
                        Tư vấn
                    </button>
                </nav>

                {/* Right Action Group */}
                <div className={s.headerActions}>
                    {/* Theme Toggle Button (Ref from /login AuthLayout) */}
                    <Tooltip
                        placement="bottom"
                        content={
                            isDark
                                ? 'Chuyển sang giao diện Sáng'
                                : 'Chuyển sang giao diện Tối'
                        }
                    >
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={s.themeToggleBtn}
                            aria-label={
                                isDark
                                    ? 'Chuyển sang giao diện Sáng'
                                    : 'Chuyển sang giao diện Tối'
                            }
                        >
                            <span className={s.themeIconWrapper}>
                                {isDark ? <SunIcon /> : <MoonIcon />}
                            </span>
                            <span className={s.themeToggleText}>
                                {isDark ? 'Sáng' : 'Tối'}
                            </span>
                        </button>
                    </Tooltip>

                    <button
                        type="button"
                        onClick={() => navigate('/public/tests')}
                        className={s.headerTestBtn}
                    >
                        Thi thử IELTS
                    </button>

                    <button
                        type="button"
                        className={s.headerLoginBtn}
                        onClick={() => navigate('/login')}
                    >
                        Đăng nhập
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        className={s.mobileMenuBtn}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileMenuOpen && (
                <div className={s.mobileNavDropdown}>
                    <button
                        type="button"
                        onClick={() => scrollTo('features')}
                        className={s.mobileNavLink}
                    >
                        Tại sao chọn TungTung
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('steps')}
                        className={s.mobileNavLink}
                    >
                        Lộ trình 3 bước
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('courses')}
                        className={s.mobileNavLink}
                    >
                        Khóa học nổi bật
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('faq')}
                        className={s.mobileNavLink}
                    >
                        Câu hỏi thường gặp
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollTo('consultation')}
                        className={s.mobileNavLink}
                    >
                        Đăng ký tư vấn
                    </button>
                    <div className={s.mobileNavDivider} />
                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen(false)
                            navigate('/public/tests')
                        }}
                        className={s.mobileNavAction}
                    >
                        Thi thử IELTS trực tuyến
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen(false)
                            navigate('/login')
                        }}
                        className={s.headerLoginBtn}
                        style={{ width: '100%' }}
                    >
                        Đăng nhập
                    </button>
                </div>
            )}
        </header>
    )
}
