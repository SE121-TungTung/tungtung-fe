import { Suspense, lazy, useState } from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import s from './Schedule.module.css'

const GAOptimizerTab = lazy(() => import('./tabs/GAOptimizerTab'))
const TeacherUnavailabilityTab = lazy(
    () => import('./tabs/TeacherUnavailabilityTab')
)

type TabId = 'ga-optimizer' | 'teacher-unavailability'

const TABS: { id: TabId; label: string }[] = [
    { id: 'ga-optimizer', label: 'Xếp TKB (GA)' },
    { id: 'teacher-unavailability', label: 'Lịch bận Giáo viên' },
]

export default function GASchedulePage() {
    const [activeTab, setActiveTab] = useState<TabId>('ga-optimizer')

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    Xếp lịch tự động (Genetic Algorithm)
                </h1>

                {/* Tab bar */}
                <div
                    style={{
                        display: 'flex',
                        gap: 0,
                        width: '100%',
                        borderBottom: '2px solid var(--color-border-soft)',
                        marginBottom: 8,
                    }}
                >
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 24px',
                                fontSize: 14,
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                color:
                                    activeTab === tab.id
                                        ? 'var(--color-brand-primary)'
                                        : 'var(--color-text-muted)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom:
                                    activeTab === tab.id
                                        ? '2px solid var(--color-brand-primary)'
                                        : '2px solid transparent',
                                marginBottom: -2,
                                cursor: 'pointer',
                                transition: 'var(--transition-colors)',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}

                    <div style={{ flex: 1 }} />

                    <ButtonPrimary
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            (window.location.href = '/admin/schedule/generate')
                        }
                    >
                        Xếp lịch Deterministic →
                    </ButtonPrimary>
                </div>

                {/* Tab content */}
                <Suspense
                    fallback={
                        <div
                            style={{
                                padding: 40,
                                textAlign: 'center',
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            Đang tải...
                        </div>
                    }
                >
                    {activeTab === 'ga-optimizer' && <GAOptimizerTab />}
                    {activeTab === 'teacher-unavailability' && (
                        <TeacherUnavailabilityTab />
                    )}
                </Suspense>
            </main>
        </div>
    )
}
