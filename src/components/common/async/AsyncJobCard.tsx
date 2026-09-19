import React, { useState, useEffect } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '../button/ButtonPrimary'
import FieldMessage from '@/components/common/typography/FieldMessage'

export interface AsyncJobHandlerProps {
    title: string
    description?: string
    onStart: () => Promise<string> // Returns jobId
    pollJob: (
        jobId: string
    ) => Promise<{
        status: string
        processed?: number
        total?: number
        error?: string
    }>
    onSuccess: () => void
    buttonText?: string
}

export const AsyncJobCard: React.FC<AsyncJobHandlerProps> = ({
    title,
    description,
    onStart,
    pollJob,
    onSuccess,
    buttonText = 'Bắt đầu',
}) => {
    const [jobId, setJobId] = useState<string | null>(null)
    const [status, setStatus] = useState<
        'IDLE' | 'STARTING' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    >('IDLE')
    const [progress, setProgress] = useState({ processed: 0, total: 0 })
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleStart = async () => {
        setStatus('STARTING')
        setErrorMsg(null)
        try {
            const id = await onStart()
            setJobId(id)
            setStatus('PENDING')
        } catch (err: any) {
            setStatus('FAILED')
            setErrorMsg(err?.message || 'Lỗi khởi tạo job')
        }
    }

    useEffect(() => {
        if (!jobId || status === 'COMPLETED' || status === 'FAILED') return

        const timer = setInterval(async () => {
            try {
                const res = await pollJob(jobId)
                setStatus(res.status as any)
                setProgress({
                    processed: res.processed || 0,
                    total: res.total || 0,
                })
                if (res.status === 'COMPLETED') {
                    clearInterval(timer)
                    if (res.error) {
                        setErrorMsg(res.error)
                    }
                } else if (res.status === 'FAILED') {
                    clearInterval(timer)
                    setErrorMsg(res.error || 'Job failed on server')
                }
            } catch (err) {
                console.error('Poll error', err)
                // keep polling or fail? Let's just keep polling unless it's a persistent error
            }
        }, 3000)

        return () => clearInterval(timer)
    }, [jobId, status, pollJob, onSuccess])

    const percent =
        progress.total > 0
            ? Math.round((progress.processed / progress.total) * 100)
            : 0

    return (
        <Card variant="glass" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            {description && (
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    {description}
                </p>
            )}

            {status === 'IDLE' && (
                <div style={{ marginTop: '16px' }}>
                    <ButtonPrimary onClick={handleStart}>
                        {buttonText}
                    </ButtonPrimary>
                </div>
            )}

            {status === 'STARTING' && (
                <div style={{ marginTop: '16px' }}>
                    <p>Đang khởi tạo...</p>
                    <div
                        className="skeleton-loader skeleton-text"
                        style={{ height: '8px' }}
                    ></div>
                </div>
            )}

            {(status === 'PENDING' || status === 'PROCESSING') && (
                <div style={{ marginTop: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                        }}
                    >
                        <span>Đang xử lý...</span>
                        <span>{percent}%</span>
                    </div>
                    {/* Native progress isn't easily styled with gradient, using simple div */}
                    <div
                        style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--color-surface-raised)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: `${percent}%`,
                                height: '100%',
                                backgroundColor: 'var(--color-brand-primary)',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'var(--color-text-secondary)',
                            marginTop: '8px',
                        }}
                    >
                        Tiến độ: {progress.processed} / {progress.total || '?'}
                    </p>
                </div>
            )}

            {status === 'COMPLETED' && (
                <div style={{ marginTop: '16px' }}>
                    {errorMsg || progress.processed < progress.total ? (
                        <div
                            style={{
                                padding: '16px',
                                background: 'var(--surface-sunken)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid var(--color-border-default)',
                            }}
                        >
                            <FieldMessage tone="warning">
                                Hoàn thành với cảnh báo ({progress.processed}/
                                {progress.total} thành công)
                            </FieldMessage>
                            {errorMsg && (
                                <pre
                                    style={{
                                        marginTop: '12px',
                                        fontSize: '13px',
                                        color: 'var(--color-error)',
                                        whiteSpace: 'pre-wrap',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        background: 'var(--surface-page-dark)',
                                        padding: '12px',
                                        borderRadius: '4px',
                                    }}
                                >
                                    {errorMsg}
                                </pre>
                            )}
                        </div>
                    ) : (
                        <FieldMessage tone="success">
                            Hoàn thành tất cả ({progress.processed}/
                            {progress.total})!
                        </FieldMessage>
                    )}
                    <div style={{ marginTop: '16px' }}>
                        <ButtonPrimary onClick={onSuccess}>
                            Tiếp tục
                        </ButtonPrimary>
                    </div>
                </div>
            )}

            {status === 'FAILED' && (
                <div style={{ marginTop: '16px' }}>
                    <FieldMessage tone="error">
                        {errorMsg || 'Xử lý thất bại'}
                    </FieldMessage>
                    <div style={{ marginTop: '16px' }}>
                        <ButtonPrimary onClick={handleStart}>
                            Thử lại
                        </ButtonPrimary>
                    </div>
                </div>
            )}
        </Card>
    )
}
