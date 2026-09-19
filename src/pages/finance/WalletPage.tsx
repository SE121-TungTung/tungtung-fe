import { useState } from 'react'
import {
    useMyWalletBalance,
    useMyWalletTransactions,
} from '@/hooks/domain/useFinance'
import { useSession } from '@/stores/session.store'
import { WalletBalanceCard } from './components/WalletBalanceCard'
import { TopUpSection } from './components/TopUpSection'
import { WithdrawSection } from './components/WithdrawSection'
import { TransactionHistoryTable } from './components/TransactionHistoryTable'
import { AdminTransactionModerator } from './components/AdminTransactionModerator'
import s from './Wallet.module.css'

export default function WalletPage() {
    const user = useSession((state) => state.user)

    // Roles checking
    const isAdmin =
        user?.role === 'office_admin' ||
        user?.role === 'center_admin' ||
        user?.role === 'system_admin'
    const isStudent = user?.role === 'student'

    // Local State
    const [historyPage, setHistoryPage] = useState(1)
    const [adminPage, setAdminPage] = useState(1)
    const [activeTab, setActiveTab] = useState<'me' | 'admin'>(
        isAdmin ? 'admin' : 'me'
    )
    const [adminFilterStatus, setAdminFilterStatus] =
        useState<string>('pending')

    // Fetch queries
    const { data: walletRes, isLoading: loadingWallet } = useMyWalletBalance()
    const { data: myTxRes, isLoading: loadingMyTx } = useMyWalletTransactions(
        historyPage,
        10
    )

    const balance =
        walletRes?.wallet_balance !== undefined
            ? Number(walletRes.wallet_balance)
            : 0

    return (
        <div className={s.container}>
            {/* Title block */}
            <div className={s.header}>
                <div>
                    <h1 className={s.title}>Ví điện tử nội bộ</h1>
                    <p className={s.subtitle}>
                        Quản lý dòng tiền thanh toán học phí, nhận lương và lịch
                        sử giao dịch.
                    </p>
                </div>

                {isAdmin && (
                    <div className={s.tabControls}>
                        <button
                            onClick={() => setActiveTab('me')}
                            className={`${s.tabBtn} ${activeTab === 'me' ? s.tabBtnActive : ''}`}
                        >
                            Ví của tôi
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`${s.tabBtn} ${activeTab === 'admin' ? s.tabBtnActive : ''}`}
                        >
                            Duyệt giao dịch ({adminFilterStatus.toUpperCase()})
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'me' && (
                <div className={s.mainGrid}>
                    {/* LEFT PANEL - Card and forms */}
                    <div className={s.leftCol}>
                        <WalletBalanceCard
                            user={user}
                            balance={balance}
                            isLoading={loadingWallet}
                        />

                        {isStudent && <TopUpSection />}

                        {!isAdmin && <WithdrawSection balance={balance} />}
                    </div>

                    {/* RIGHT PANEL - My transaction history */}
                    <div>
                        <TransactionHistoryTable
                            transactions={myTxRes?.data}
                            isLoading={loadingMyTx}
                            currentPage={historyPage}
                            totalPages={myTxRes?.meta?.total_pages}
                            onPageChange={setHistoryPage}
                        />
                    </div>
                </div>
            )}

            {/* ADMIN ROUTE - Approving dashboard */}
            {activeTab === 'admin' && isAdmin && (
                <AdminTransactionModerator
                    filterStatus={adminFilterStatus}
                    page={adminPage}
                    onFilterChange={(st) => {
                        setAdminFilterStatus(st)
                        setAdminPage(1)
                    }}
                    onPageChange={setAdminPage}
                />
            )}
        </div>
    )
}
