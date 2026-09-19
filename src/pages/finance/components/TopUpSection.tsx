import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { useRequestWalletTopUp } from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import s from '../Wallet.module.css'

const QUICK_AMOUNTS = [
    '100000',
    '200000',
    '500000',
    '1000000',
    '2000000',
    '5000000',
]

export function TopUpSection() {
    const [topupAmount, setTopupAmount] = useState<string>('200000')
    const [topupGateway, setTopupGateway] = useState<'VNPAY' | 'MOMO'>('VNPAY')

    const requestTopUp = useRequestWalletTopUp()
    const { alert, confirm } = useDialog()
    const queryClient = useQueryClient()

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

    return (
        <Card variant="outline" className={s.formCard}>
            <h3 className={s.formTitle}>Nạp tiền vào ví</h3>
            <form onSubmit={handleTopUp} className={s.form}>
                <div>
                    <label className={s.formLabel}>Chọn số tiền nhanh:</label>
                    <div className={s.amountGrid}>
                        {QUICK_AMOUNTS.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setTopupAmount(amt)}
                                className={`${s.amountPill} ${topupAmount === amt ? s.amountPillActive : ''}`}
                            >
                                {(parseInt(amt) / 1000).toLocaleString()}k
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="topupInput" className={s.formLabel}>
                        Số tiền nạp (VND):
                    </label>
                    <input
                        id="topupInput"
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        placeholder="Nhập số tiền..."
                        className={s.inputField}
                    />
                </div>

                <div>
                    <label htmlFor="topupGateway" className={s.formLabel}>
                        Cổng thanh toán tự động:
                    </label>
                    <select
                        id="topupGateway"
                        value={topupGateway}
                        onChange={(e) =>
                            setTopupGateway(e.target.value as 'VNPAY' | 'MOMO')
                        }
                        className={s.selectField}
                    >
                        <option value="VNPAY">VNPay (Thử nghiệm)</option>
                        <option value="MOMO">Ví MoMo (Thử nghiệm)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={requestTopUp.isPending}
                    className={`${s.submitBtnPrimary} ${requestTopUp.isPending ? s.submitBtnDisabled : ''}`}
                >
                    {requestTopUp.isPending
                        ? 'Đang tạo giao dịch...'
                        : 'Nạp tiền vào ví'}
                </button>
            </form>
        </Card>
    )
}
