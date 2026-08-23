import Card from '@/components/common/card/Card'
import type { User } from '@/types/auth'
import s from '../Wallet.module.css'

interface WalletBalanceCardProps {
    user: User | null | undefined
    balance: number
    isLoading: boolean
}

export function WalletBalanceCard({
    user,
    balance,
    isLoading,
}: WalletBalanceCardProps) {
    const fullName = user ? `${user.firstName} ${user.lastName}` : '—'
    const role = user?.role?.toUpperCase() || 'USER'

    return (
        <Card variant="glass" className={s.glassCard}>
            <div className={s.cardGlowOrb} />

            <div className={s.cardTopRow}>
                <div>
                    <span className={s.cardLabel}>Số dư Ví nội bộ</span>
                    <h2 className={s.cardBalance}>
                        {isLoading ? '...' : balance.toLocaleString()}{' '}
                        <span className={s.cardUnit}>đ</span>
                    </h2>
                </div>
                <div className={s.cardBrandLogo}>TUNGTUNG</div>
            </div>

            <div className={s.cardBottomRow}>
                <div>
                    <span className={s.cardUserLabel}>Chủ tài khoản</span>
                    <span className={s.cardUserName}>{fullName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={s.cardUserLabel}>Vai trò</span>
                    <span className={s.roleBadge}>{role}</span>
                </div>
            </div>
        </Card>
    )
}
