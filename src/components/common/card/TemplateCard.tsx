import React from 'react'
import s from './TemplateCard.module.css'
import ButtonGlow from '@/components/common/button/ButtonGlow'

export type TemplateCardProps = {
    image?: string
    imageAlt?: string
    tag?: React.ReactNode
    title: React.ReactNode
    excerpt?: React.ReactNode
    ctaText?: string
    ctaIcon?: React.ReactNode
    onCta?: () => void
    className?: string
    children?: React.ReactNode
    mode?: 'light' | 'dark' // Thêm prop mode
}

export default function TemplateCard({
    image,
    imageAlt = '',
    tag,
    title,
    excerpt,
    ctaText,
    ctaIcon,
    onCta,
    className = '',
    children,
    mode = 'light',
}: TemplateCardProps) {
    const hasBodyContent = excerpt || children

    return (
        <article className={[s.templateCard, s[mode], className].join(' ')}>
            {image && <img className={s.media} src={image} alt={imageAlt} />}

            <div className={s.content}>
                {tag && <div className={s.tagRow}>{tag}</div>}

                {title && <h4 className={s.title}>{title}</h4>}

                {title && hasBodyContent && <div className={s.divider} />}

                {excerpt && <p className={s.excerpt}>{excerpt}</p>}

                {children}

                {hasBodyContent && ctaText && <div className={s.divider} />}

                {ctaText && (
                    <div className={s.footer}>
                        <ButtonGlow
                            size="sm"
                            variant="glass"
                            rightIcon={ctaIcon}
                            onClick={onCta}
                            mode={mode}
                        >
                            {ctaText}
                        </ButtonGlow>
                    </div>
                )}
            </div>
        </article>
    )
}
