import React from 'react'
import Card from '@/components/common/card/Card'

export const EmptyState: React.FC<{
    icon?: React.ReactNode
    title: string
    description?: string
}> = ({ icon, title, description }) => {
    return (
        <Card
            variant="glass"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
            }}
        >
            {icon && (
                <div
                    style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        opacity: 0.5,
                    }}
                >
                    {icon}
                </div>
            )}
            <h4
                style={{
                    margin: '0 0 8px 0',
                    color: 'var(--color-text-primary)',
                }}
            >
                {title}
            </h4>
            {description && <p style={{ margin: 0 }}>{description}</p>}
        </Card>
    )
}
