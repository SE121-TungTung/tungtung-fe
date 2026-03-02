import React from 'react'

interface SkeletonProps {
    className?: string
    width?: string | number
    height?: string | number
    variant?: 'text' | 'rect' | 'circle'
    style?: React.CSSProperties
    count?: number
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    variant = 'rect',
    style,
    count = 1,
}) => {
    if (count > 1) {
        return (
            <>
                {[...Array(count)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className={className}
                        width={width}
                        height={height}
                        variant={variant}
                        style={style}
                        count={1}
                    />
                ))}
            </>
        )
    }

    const styles: React.CSSProperties = {
        width: width,
        height: height,
        ...style,
    }

    const variantClass =
        variant === 'circle'
            ? 'skeleton-circle'
            : variant === 'text'
              ? 'skeleton-text'
              : ''

    return (
        <span
            className={`skeleton-loader ${variantClass} ${className}`}
            style={styles}
            aria-hidden="true"
        />
    )
}

export default Skeleton
