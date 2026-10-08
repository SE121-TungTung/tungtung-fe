import React from 'react'
import Skeleton from '@/components/effect/Skeleton'
import s from './PageSkeleton.module.css'

export const PageSkeleton: React.FC = () => {
    return (
        <div className={s.container} aria-label="Đang tải trang…">
            {/* Header row skeleton */}
            <div className={s.headerRow}>
                <div className={s.titleGroup}>
                    <Skeleton width={180} height={14} variant="text" />
                    <Skeleton
                        width={320}
                        height={32}
                        variant="rect"
                        style={{ borderRadius: 8 }}
                    />
                </div>
                <div className={s.actionGroup}>
                    <Skeleton
                        width={110}
                        height={38}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                    <Skeleton
                        width={42}
                        height={38}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                </div>
            </div>

            {/* Quick stats or cards row */}
            <div className={s.statsGrid}>
                {[1, 2, 3].map((key) => (
                    <div key={key} className={s.statCard}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Skeleton width={100} height={14} variant="text" />
                            <Skeleton width={32} height={32} variant="circle" />
                        </div>
                        <Skeleton
                            width={140}
                            height={28}
                            variant="rect"
                            style={{ borderRadius: 6 }}
                        />
                        <Skeleton width="75%" height={12} variant="text" />
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className={s.contentGrid}>
                <div className={s.mainPanel}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Skeleton
                            width={160}
                            height={20}
                            variant="rect"
                            style={{ borderRadius: 6 }}
                        />
                        <Skeleton
                            width={90}
                            height={28}
                            variant="rect"
                            style={{ borderRadius: 8 }}
                        />
                    </div>
                    <Skeleton
                        height={180}
                        variant="rect"
                        style={{ borderRadius: 12 }}
                    />
                    <Skeleton
                        height={80}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                </div>

                <div className={s.sidePanel}>
                    <Skeleton
                        width={120}
                        height={18}
                        variant="rect"
                        style={{ borderRadius: 6 }}
                    />
                    <Skeleton
                        height={60}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                    <Skeleton
                        height={60}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                    <Skeleton
                        height={60}
                        variant="rect"
                        style={{ borderRadius: 10 }}
                    />
                </div>
            </div>
        </div>
    )
}

export default PageSkeleton
