import { Link, useNavigate } from 'react-router-dom'
import s from './PublicHomePage.module.css'

export default function PublicHeader() {
    const navigate = useNavigate()
    
    return (
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
    )
}
