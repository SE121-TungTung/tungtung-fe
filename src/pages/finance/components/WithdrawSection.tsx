import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { useRequestWalletWithdrawal } from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import s from '../Wallet.module.css'

interface WithdrawSectionProps {
    balance: number
}

const BANK_OPTIONS = [
    'Momo Mock',
    'Vietcombank',
    'Techcombank',
    'MB Bank',
    'BIDV',
]

export function WithdrawSection({ balance }: WithdrawSectionProps) {
    const [withdrawAmount, setWithdrawAmount] = useState<string>('')
    const [bankName, setBankName] = useState<string>('Momo Mock')
    const [bankAccount, setBankAccount] = useState<string>('')
    const [bankAccountName, setBankAccountName] = useState<string>('')

    const requestWithdraw = useRequestWalletWithdrawal()
    const { alert } = useDialog()

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

    return (
        <Card variant="outline" className={s.formCard}>
            <h3 className={s.formTitle}>Rút tiền về tài khoản ngân hàng</h3>
            <form onSubmit={handleWithdraw} className={s.form}>
                <div>
                    <label htmlFor="withdrawAmount" className={s.formLabel}>
                        Số tiền rút (VND):
                    </label>
                    <input
                        id="withdrawAmount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Nhập số tiền..."
                        className={s.inputField}
                    />
                </div>

                <div>
                    <label htmlFor="withdrawBank" className={s.formLabel}>
                        Ngân hàng / Ví nhận:
                    </label>
                    <select
                        id="withdrawBank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={s.selectField}
                    >
                        {BANK_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="withdrawAccount" className={s.formLabel}>
                        Số tài khoản nhận:
                    </label>
                    <input
                        id="withdrawAccount"
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Số tài khoản / Số điện thoại..."
                        className={s.inputField}
                    />
                </div>

                <div>
                    <label htmlFor="withdrawName" className={s.formLabel}>
                        Tên chủ tài khoản (Không dấu):
                    </label>
                    <input
                        id="withdrawName"
                        type="text"
                        value={bankAccountName}
                        onChange={(e) =>
                            setBankAccountName(e.target.value.toUpperCase())
                        }
                        placeholder="NGUYEN VAN A..."
                        className={s.inputField}
                    />
                </div>

                <button
                    type="submit"
                    disabled={requestWithdraw.isPending}
                    className={`${s.submitBtnSecondary} ${requestWithdraw.isPending ? s.submitBtnDisabled : ''}`}
                >
                    {requestWithdraw.isPending
                        ? 'Đang tạo yêu cầu...'
                        : 'Tạo yêu cầu rút tiền'}
                </button>
            </form>
        </Card>
    )
}
