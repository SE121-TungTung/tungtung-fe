import { useState, useRef } from 'react'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    useMyWalletBalance,
    useMyWalletTransactions,
    useRequestWalletTopUp,
    useRequestWalletWithdrawal,
    useAdminWalletTransactions,
    useAdminApproveWalletTransaction,
    useAdminRejectWalletTransaction,
} from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import { useSession } from '@/stores/session.store'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import s from '../admin/finance/Finance.module.css'

export default function WalletPage() {
    const { user } = useSession()
    const { alert, confirm } = useDialog()
    const queryClient = useQueryClient()

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
    const noteRef = useRef('')
    const [adminFilterStatus, setAdminFilterStatus] =
        useState<string>('pending')

    // Top-up form state (Student)
    const [topupAmount, setTopupAmount] = useState<string>('200000')
    const [topupGateway, setTopupGateway] = useState<'VNPAY' | 'MOMO'>('VNPAY')

    // Withdrawal form state (Student / Teacher)
    const [withdrawAmount, setWithdrawAmount] = useState<string>('')
    const [bankName, setBankName] = useState<string>('Momo Mock')
    const [bankAccount, setBankAccount] = useState<string>('')
    const [bankAccountName, setBankAccountName] = useState<string>('')

    // Fetch queries
    const { data: walletRes, isLoading: loadingWallet } = useMyWalletBalance()
    const { data: myTxRes, isLoading: loadingMyTx } = useMyWalletTransactions(
        historyPage,
        10
    )
    const { data: adminTxRes, isLoading: loadingAdminTx } =
        useAdminWalletTransactions(
            {
                status: adminFilterStatus,
                page: adminPage,
                limit: 10,
            },
            { enabled: isAdmin }
        )

    // Mutations
    const requestTopUp = useRequestWalletTopUp()
    const requestWithdraw = useRequestWalletWithdrawal()
    const approveTx = useAdminApproveWalletTransaction()
    const rejectTx = useAdminRejectWalletTransaction()

    const balance =
        walletRes?.wallet_balance !== undefined
            ? Number(walletRes.wallet_balance)
            : 0

    // Handlers
    const handleTopUp = (e: React.FormEvent) => {
        e.preventDefault()
        const amountNum = parseFloat(topupAmount)
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Vui lòng nhập số tiền nạp hợp lệ', 'Lỗi')
            return
        }

        requestTopUp.mutate(
            {
                amount: amountNum,
                gateway: topupGateway.toLowerCase() as any,
            },
            {
                onSuccess: async (res) => {
                    const txId = res.id
                    // Show simulation checkout dialog
                    const shouldSimulate = await confirm({
                        title: 'Môi trường Giả lập Thanh toán',
                        message: `Yêu cầu nạp tiền #${txId.split('-')[0].toUpperCase()} đã được tạo.\nSố tiền: ${amountNum.toLocaleString()} đ\nCổng thanh toán: ${topupGateway}\n\nBạn có muốn mô phỏng Webhook thành công từ ví/ngân hàng để cộng tiền ngay lập tức không?`,
                        confirmText: 'Giả lập Thanh toán',
                        cancelText: 'Để sau (Duyệt thủ công)',
                        type: 'confirm',
                    })

                    if (shouldSimulate) {
                        try {
                            await api('/api/v1/wallet/topup/webhook', {
                                method: 'POST',
                                body: JSON.stringify({
                                    transaction_id: txId,
                                    status: 'success',
                                }),
                            })
                            await alert(
                                'Giao dịch giả lập thành công! Tài khoản đã được cộng tiền.',
                                'Thành công'
                            )
                            // Refresh balance & history
                            queryClient.invalidateQueries({
                                queryKey: ['wallet-balance'],
                            })
                            queryClient.invalidateQueries({
                                queryKey: ['wallet-transactions'],
                            })
                        } catch (err: any) {
                            await alert(
                                `Webhook giả lập thất bại: ${err.message || 'Lỗi kết nối'}`
                            )
                        }
                    } else {
                        await alert(
                            'Yêu cầu đã được lưu dưới dạng Chờ duyệt (Pending). OFFICE_ADMIN cần phê duyệt thủ công.',
                            'Thông báo'
                        )
                    }
                },
                onError: (err: any) => {
                    alert(err.message || 'Có lỗi xảy ra', 'Lỗi')
                },
            }
        )
    }

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault()
        const amountNum = parseFloat(withdrawAmount)
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Vui lòng nhập số tiền rút hợp lệ', 'Lỗi')
            return
        }
        if (amountNum > balance) {
            alert(
                'Số dư tài khoản không đủ để thực hiện giao dịch',
                'Lỗi số dư'
            )
            return
        }
        if (!bankAccount || !bankAccountName) {
            alert(
                'Vui lòng điền đầy đủ thông tin tài khoản nhận tiền',
                'Lỗi thông tin'
            )
            return
        }

        requestWithdraw.mutate(
            {
                amount: amountNum,
                bank_name: bankName,
                account_number: bankAccount,
                account_name: bankAccountName,
            },
            {
                onSuccess: async () => {
                    await alert(
                        'Gửi yêu cầu rút tiền thành công. Số dư của bạn tạm thời đã được giữ lại chờ OFFICE_ADMIN duyệt.',
                        'Thành công'
                    )
                    setWithdrawAmount('')
                    setBankAccount('')
                    setBankAccountName('')
                },
                onError: (err: any) => {
                    alert(err.message || 'Có lỗi xảy ra', 'Lỗi')
                },
            }
        )
    }

    const handleAdminApprove = async (txId: string) => {
        noteRef.current = 'Đã duyệt qua hệ thống quản lý'
        const confirmApprove = await confirm({
            title: 'Duyệt giao dịch',
            message: '',
            confirmText: 'Phê duyệt',
            cancelText: 'Hủy',
            renderConfirm: () => (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '4px 0',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}
                    >
                        Bạn có chắc chắn muốn PHÊ DUYỆT giao dịch này không?
                    </p>
                    <label
                        htmlFor="approveNoteInput"
                        style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Nhập ghi chú phê duyệt (tùy chọn):
                    </label>
                    <input
                        id="approveNoteInput"
                        type="text"
                        defaultValue={noteRef.current}
                        onChange={(e) => {
                            noteRef.current = e.target.value
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 'var(--input-radius)',
                            border: '1px solid var(--input-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--input-text)',
                        }}
                    />
                </div>
            ),
        })
        if (!confirmApprove) return

        approveTx.mutate(
            {
                txId,
                payload: { note: noteRef.current || undefined },
            },
            {
                onSuccess: () => {
                    alert('Giao dịch đã được duyệt thành công!', 'Thành công')
                },
                onError: (err: any) => {
                    alert(err.message || 'Lỗi phê duyệt', 'Lỗi')
                },
            }
        )
    }

    const handleAdminReject = async (txId: string) => {
        noteRef.current = 'Không đúng thông tin giao dịch'
        const confirmReject = await confirm({
            title: 'Từ chối giao dịch',
            message: '',
            confirmText: 'Từ chối',
            cancelText: 'Hủy',
            type: 'danger',
            renderConfirm: () => (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '4px 0',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                        }}
                    >
                        Bạn có chắc chắn muốn TỪ CHỐI giao dịch này không? Số
                        tiền (nếu là rút tiền) sẽ được hoàn trả.
                    </p>
                    <label
                        htmlFor="rejectNoteInput"
                        style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Nhập lý do từ chối (bắt buộc):
                    </label>
                    <input
                        id="rejectNoteInput"
                        type="text"
                        defaultValue={noteRef.current}
                        onChange={(e) => {
                            noteRef.current = e.target.value
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 'var(--input-radius)',
                            border: '1px solid var(--input-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--input-text)',
                        }}
                    />
                </div>
            ),
        })
        if (!confirmReject) return
        if (!noteRef.current.trim()) {
            alert('Vui lòng nhập lý do từ chối', 'Lỗi')
            return
        }

        rejectTx.mutate(
            {
                txId,
                payload: { note: noteRef.current },
            },
            {
                onSuccess: () => {
                    alert('Giao dịch đã bị từ chối!', 'Thành công')
                },
                onError: (err: any) => {
                    alert(err.message || 'Lỗi từ chối', 'Lỗi')
                },
            }
        )
    }

    const formatRefType = (ref: string) => {
        switch (ref) {
            case 'tuition':
                return 'Học phí'
            case 'salary':
                return 'Lương nhận'
            case 'refund':
                return 'Hoàn tiền'
            case 'top_up':
                return 'Nạp tiền'
            case 'withdrawal':
                return 'Rút tiền'
            default:
                return ref
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
            }}
        >
            {/* Title block */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: '26px',
                            fontWeight: 800,
                            margin: '0 0 4px 0',
                            background:
                                'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Ví điện tử nội bộ
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            fontSize: '14px',
                        }}
                    >
                        Quản lý dòng tiền thanh toán học phí, nhận lương và lịch
                        sử giao dịch.
                    </p>
                </div>

                {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setActiveTab('me')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border:
                                    activeTab === 'me'
                                        ? 'none'
                                        : '1px solid var(--color-border-soft)',
                                background:
                                    activeTab === 'me'
                                        ? 'var(--color-brand-primary)'
                                        : 'transparent',
                                color:
                                    activeTab === 'me'
                                        ? 'white'
                                        : 'var(--color-text-primary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Ví của tôi
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border:
                                    activeTab === 'admin'
                                        ? 'none'
                                        : '1px solid var(--color-border-soft)',
                                background:
                                    activeTab === 'admin'
                                        ? 'var(--color-brand-primary)'
                                        : 'transparent',
                                color:
                                    activeTab === 'admin'
                                        ? 'white'
                                        : 'var(--color-text-primary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Duyệt giao dịch ({adminFilterStatus.toUpperCase()})
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'me' && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '24px',
                    }}
                >
                    {/* LEFT PANEL - Card and forms */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                        }}
                    >
                        {/* Premium Glass Card */}
                        <Card
                            variant="glass"
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--color-brand-primary), var(--primitive-lapis-600))',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '220px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                                borderRadius: '16px',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-20%',
                                    right: '-10%',
                                    width: '150px',
                                    height: '150px',
                                    background:
                                        'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                }}
                            />

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    zIndex: 1,
                                }}
                            >
                                <div>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            opacity: 0.8,
                                        }}
                                    >
                                        Số dư Ví nội bộ
                                    </span>
                                    <h2
                                        style={{
                                            fontSize: '32px',
                                            fontWeight: 800,
                                            margin: '8px 0 0 0',
                                            fontFamily:
                                                'var(--primitive-font-mono)',
                                            letterSpacing: '-0.03em',
                                        }}
                                    >
                                        {loadingWallet
                                            ? '...'
                                            : balance.toLocaleString()}{' '}
                                        <span
                                            style={{
                                                fontSize: '20px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            đ
                                        </span>
                                    </h2>
                                </div>
                                <div
                                    style={{
                                        fontSize: '20px',
                                        fontWeight: 800,
                                        fontStyle: 'italic',
                                        opacity: 0.9,
                                    }}
                                >
                                    TUNGTUNG
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    zIndex: 1,
                                }}
                            >
                                <div>
                                    <span
                                        style={{
                                            fontSize: '9px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            opacity: 0.7,
                                            display: 'block',
                                        }}
                                    >
                                        Chủ tài khoản
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {user
                                            ? `${user.firstName} ${user.lastName}`
                                            : '—'}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span
                                        style={{
                                            fontSize: '9px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            opacity: 0.7,
                                            display: 'block',
                                        }}
                                    >
                                        Vai trò
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: 'rgba(255,255,255,0.2)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        {user?.role?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Top-up Form (Student only) */}
                        {isStudent && (
                            <Card
                                variant="outline"
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 700,
                                    }}
                                >
                                    Nạp tiền vào ví
                                </h3>
                                <form
                                    onSubmit={handleTopUp}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Chọn số tiền nhanh:
                                        </label>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    'repeat(3, 1fr)',
                                                gap: '8px',
                                            }}
                                        >
                                            {[
                                                '100000',
                                                '200000',
                                                '500000',
                                                '1000000',
                                                '2000000',
                                                '5000000',
                                            ].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() =>
                                                        setTopupAmount(amt)
                                                    }
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border:
                                                            topupAmount === amt
                                                                ? '1.5px solid var(--color-brand-primary)'
                                                                : '1px solid var(--color-border-soft)',
                                                        background:
                                                            topupAmount === amt
                                                                ? 'rgba(var(--primitive-blue-500), 0.1)'
                                                                : 'var(--color-surface-raised)',
                                                        color:
                                                            topupAmount === amt
                                                                ? 'var(--color-brand-primary)'
                                                                : 'var(--color-text-primary)',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    {(
                                                        parseInt(amt) / 1000
                                                    ).toLocaleString()}
                                                    k
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="topupInput"
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Số tiền nạp (VND):
                                        </label>
                                        <input
                                            id="topupInput"
                                            type="number"
                                            value={topupAmount}
                                            onChange={(e) =>
                                                setTopupAmount(e.target.value)
                                            }
                                            placeholder="Nhập số tiền..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="topupGateway"
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Cổng thanh toán tự động:
                                        </label>
                                        <select
                                            id="topupGateway"
                                            value={topupGateway}
                                            onChange={(e) =>
                                                setTopupGateway(
                                                    e.target.value as
                                                        | 'VNPAY'
                                                        | 'MOMO'
                                                )
                                            }
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        >
                                            <option value="VNPAY">
                                                VNPay (Thử nghiệm)
                                            </option>
                                            <option value="MOMO">
                                                Ví MoMo (Thử nghiệm)
                                            </option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={requestTopUp.isPending}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background:
                                                'var(--color-brand-primary)',
                                            color: 'white',
                                            fontWeight: 700,
                                            cursor: requestTopUp.isPending
                                                ? 'not-allowed'
                                                : 'pointer',
                                            transition: 'opacity 0.2s',
                                        }}
                                    >
                                        {requestTopUp.isPending
                                            ? 'Đang tạo giao dịch...'
                                            : 'Nạp tiền vào ví'}
                                    </button>
                                </form>
                            </Card>
                        )}

                        {/* Withdrawal Form (Student / Teacher / TA) */}
                        {!isAdmin && (
                            <Card
                                variant="outline"
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 700,
                                    }}
                                >
                                    Rút tiền về tài khoản ngân hàng
                                </h3>
                                <form
                                    onSubmit={handleWithdraw}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                    }}
                                >
                                    <div>
                                        <label
                                            htmlFor="withdrawAmount"
                                            style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Số tiền rút (VND):
                                        </label>
                                        <input
                                            id="withdrawAmount"
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) =>
                                                setWithdrawAmount(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nhập số tiền..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="withdrawBank"
                                            style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Ngân hàng / Ví nhận:
                                        </label>
                                        <select
                                            id="withdrawBank"
                                            value={bankName}
                                            onChange={(e) =>
                                                setBankName(e.target.value)
                                            }
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        >
                                            <option value="Momo Mock">
                                                Ví MoMo (Mock)
                                            </option>
                                            <option value="Vietcombank">
                                                Vietcombank
                                            </option>
                                            <option value="Techcombank">
                                                Techcombank
                                            </option>
                                            <option value="MB Bank">
                                                MB Bank
                                            </option>
                                            <option value="BIDV">BIDV</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="withdrawAccount"
                                            style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Số tài khoản nhận:
                                        </label>
                                        <input
                                            id="withdrawAccount"
                                            type="text"
                                            value={bankAccount}
                                            onChange={(e) =>
                                                setBankAccount(e.target.value)
                                            }
                                            placeholder="Số tài khoản / Số điện thoại..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="withdrawName"
                                            style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Tên chủ tài khoản (Không dấu):
                                        </label>
                                        <input
                                            id="withdrawName"
                                            type="text"
                                            value={bankAccountName}
                                            onChange={(e) =>
                                                setBankAccountName(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            placeholder="NGUYEN VAN A..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--input-radius)',
                                                border: '1px solid var(--input-border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--input-text)',
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={requestWithdraw.isPending}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background:
                                                'var(--color-brand-secondary)',
                                            color: 'white',
                                            fontWeight: 700,
                                            cursor: requestWithdraw.isPending
                                                ? 'not-allowed'
                                                : 'pointer',
                                            transition: 'opacity 0.2s',
                                        }}
                                    >
                                        {requestWithdraw.isPending
                                            ? 'Đang tạo yêu cầu...'
                                            : 'Tạo yêu cầu rút tiền'}
                                    </button>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT PANEL - My transaction history */}
                    <div>
                        <Card
                            variant="outline"
                            style={{ height: '100%', padding: 0 }}
                        >
                            <div
                                style={{
                                    padding: '20px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 700,
                                    }}
                                >
                                    Lịch sử giao dịch ví
                                </h3>
                            </div>

                            {loadingMyTx ? (
                                <div className={s.loadingWrapper}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={s.skeletonRow}
                                        />
                                    ))}
                                </div>
                            ) : !myTxRes?.data || myTxRes.data.length === 0 ? (
                                <EmptyState
                                    title="Chưa có giao dịch"
                                    description="Lịch sử nạp, rút, thanh toán sẽ xuất hiện ở đây."
                                />
                            ) : (
                                <div
                                    className={s.tableWrapper}
                                    style={{
                                        minHeight: '350px',
                                        padding: '0 20px 20px 20px',
                                    }}
                                >
                                    <table className={s.table}>
                                        <thead>
                                            <tr>
                                                <th>Thời gian</th>
                                                <th>Loại</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myTxRes.data.map((tx) => {
                                                const isCredit =
                                                    tx.type === 'credit'
                                                let statusClass = s.badgePending
                                                if (tx.status === 'approved')
                                                    statusClass = s.badgeSuccess
                                                if (tx.status === 'rejected')
                                                    statusClass =
                                                        s.badgeRejected

                                                return (
                                                    <tr
                                                        key={tx.id}
                                                        className={s.tableRow}
                                                    >
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    '12px',
                                                                color: 'var(--color-text-secondary)',
                                                            }}
                                                        >
                                                            {new Date(
                                                                tx.created_at
                                                            ).toLocaleString(
                                                                'vi-VN',
                                                                {
                                                                    dateStyle:
                                                                        'short',
                                                                    timeStyle:
                                                                        'short',
                                                                }
                                                            )}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {formatRefType(
                                                                tx.reference_type
                                                            )}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontFamily:
                                                                    'var(--primitive-font-mono)',
                                                                fontWeight: 700,
                                                                color: isCredit
                                                                    ? 'var(--color-status-success-dark, #02bc2a)'
                                                                    : 'var(--color-status-danger, #ef4444)',
                                                            }}
                                                        >
                                                            {isCredit
                                                                ? '+'
                                                                : '-'}
                                                            {tx.amount.toLocaleString()}{' '}
                                                            đ
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`${s.badge} ${statusClass}`}
                                                            >
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize:
                                                                    '12px',
                                                                color: 'var(--color-text-secondary)',
                                                                maxWidth:
                                                                    '150px',
                                                                overflow:
                                                                    'hidden',
                                                                textOverflow:
                                                                    'ellipsis',
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                        >
                                                            {tx.note || '—'}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {myTxRes?.meta && myTxRes.meta.total_pages > 1 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '16px',
                                        gap: '8px',
                                        borderTop:
                                            '1px solid var(--color-border-soft)',
                                    }}
                                >
                                    <button
                                        disabled={historyPage === 1}
                                        onClick={() =>
                                            setHistoryPage((p) => p - 1)
                                        }
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-border-soft)',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Trước
                                    </button>
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {historyPage} /{' '}
                                        {myTxRes.meta.total_pages}
                                    </span>
                                    <button
                                        disabled={
                                            historyPage ===
                                            myTxRes.meta.total_pages
                                        }
                                        onClick={() =>
                                            setHistoryPage((p) => p + 1)
                                        }
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-border-soft)',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* ADMIN ROUTE - Approving dashboard */}
            {activeTab === 'admin' && isAdmin && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    {/* Filter selector */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--color-surface-raised)',
                            padding: '16px 20px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border-soft)',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['pending', 'approved', 'rejected', 'all'].map(
                                (st) => (
                                    <button
                                        key={st}
                                        onClick={() => {
                                            setAdminFilterStatus(st)
                                            setAdminPage(1)
                                        }}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            background:
                                                adminFilterStatus === st
                                                    ? 'var(--color-brand-primary)'
                                                    : 'transparent',
                                            color:
                                                adminFilterStatus === st
                                                    ? 'white'
                                                    : 'var(--color-text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {st === 'pending'
                                            ? 'Chờ duyệt'
                                            : st === 'approved'
                                              ? 'Đã duyệt'
                                              : st === 'rejected'
                                                ? 'Bị từ chối'
                                                : 'Tất cả'}
                                    </button>
                                )
                            )}
                        </div>
                        <div
                            style={{
                                fontSize: '13px',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            Danh sách giao dịch nạp/rút cần Office Admin xử lý.
                        </div>
                    </div>

                    <Card variant="outline" style={{ padding: 0 }}>
                        {loadingAdminTx ? (
                            <div className={s.loadingWrapper}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className={s.skeletonRow} />
                                ))}
                            </div>
                        ) : !adminTxRes?.data ||
                          adminTxRes.data.length === 0 ? (
                            <EmptyState
                                title="Không tìm thấy giao dịch nào"
                                description="Không có yêu cầu nạp/rút tiền nào khớp với bộ lọc."
                            />
                        ) : (
                            <div
                                className={s.tableWrapper}
                                style={{ padding: '0 20px 20px 20px' }}
                            >
                                <table className={s.table}>
                                    <thead>
                                        <tr>
                                            <th>Người yêu cầu</th>
                                            <th>Thời gian</th>
                                            <th>Loại giao dịch</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Chi tiết</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminTxRes.data.map((tx) => {
                                            const isCredit =
                                                tx.type === 'credit'
                                            let statusClass = s.badgePending
                                            if (tx.status === 'approved')
                                                statusClass = s.badgeSuccess
                                            if (tx.status === 'rejected')
                                                statusClass = s.badgeRejected

                                            return (
                                                <tr
                                                    key={tx.id}
                                                    className={s.tableRow}
                                                >
                                                    <td>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {tx.user_fullname ||
                                                                    'Người dùng ẩn'}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        '11px',
                                                                    color: 'var(--color-text-secondary)',
                                                                }}
                                                            >
                                                                {tx.user_email ||
                                                                    '—'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        {new Date(
                                                            tx.created_at
                                                        ).toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {formatRefType(
                                                            tx.reference_type
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontFamily:
                                                                'var(--primitive-font-mono)',
                                                            fontWeight: 700,
                                                            color: isCredit
                                                                ? 'var(--color-status-success-dark, #02bc2a)'
                                                                : 'var(--color-status-danger, #ef4444)',
                                                        }}
                                                    >
                                                        {isCredit ? '+' : '-'}
                                                        {tx.amount.toLocaleString()}{' '}
                                                        đ
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`${s.badge} ${statusClass}`}
                                                        >
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-secondary)',
                                                            maxWidth: '200px',
                                                        }}
                                                    >
                                                        {tx.note || '—'}
                                                        {tx.reference_type ===
                                                            'withdrawal' &&
                                                            tx.extra_metadata
                                                                ?.bank_name && (
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                        marginTop:
                                                                            '4px',
                                                                        padding:
                                                                            '4px',
                                                                        background:
                                                                            'rgba(255,255,255,0.05)',
                                                                        borderRadius:
                                                                            '4px',
                                                                    }}
                                                                >
                                                                    Bank:{' '}
                                                                    {
                                                                        tx
                                                                            .extra_metadata
                                                                            .bank_name
                                                                    }{' '}
                                                                    | A/C:{' '}
                                                                    {
                                                                        tx
                                                                            .extra_metadata
                                                                            .account_number
                                                                    }{' '}
                                                                    | Name:{' '}
                                                                    {
                                                                        tx
                                                                            .extra_metadata
                                                                            .account_name
                                                                    }
                                                                </div>
                                                            )}
                                                    </td>
                                                    <td>
                                                        {tx.status ===
                                                        'pending' ? (
                                                            <div
                                                                className={
                                                                    s.actionCell
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        s.tooltipWrapper
                                                                    }
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAdminApprove(
                                                                                tx.id
                                                                            )
                                                                        }
                                                                        className={`${s.actionBtn} ${s.actionBtnApprove}`}
                                                                        title="Duyệt giao dịch"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <span
                                                                        className={
                                                                            s.tooltipText
                                                                        }
                                                                    >
                                                                        Duyệt
                                                                        giao
                                                                        dịch
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        s.tooltipWrapper
                                                                    }
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAdminReject(
                                                                                tx.id
                                                                            )
                                                                        }
                                                                        className={`${s.actionBtn} ${s.actionBtnReject}`}
                                                                        title="Từ chối"
                                                                    >
                                                                        ✗
                                                                    </button>
                                                                    <span
                                                                        className={
                                                                            s.tooltipText
                                                                        }
                                                                    >
                                                                        Từ chối
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                    color: 'var(--color-text-secondary)',
                                                                }}
                                                            >
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Admin Pagination */}
                        {adminTxRes?.meta &&
                            adminTxRes.meta.total_pages > 1 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '16px',
                                        gap: '8px',
                                        borderTop:
                                            '1px solid var(--color-border-soft)',
                                    }}
                                >
                                    <button
                                        disabled={adminPage === 1}
                                        onClick={() =>
                                            setAdminPage((p) => p - 1)
                                        }
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-border-soft)',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Trước
                                    </button>
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {adminPage} /{' '}
                                        {adminTxRes.meta.total_pages}
                                    </span>
                                    <button
                                        disabled={
                                            adminPage ===
                                            adminTxRes.meta.total_pages
                                        }
                                        onClick={() =>
                                            setAdminPage((p) => p + 1)
                                        }
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-border-soft)',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                    </Card>
                </div>
            )}
        </div>
    )
}
