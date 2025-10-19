import { type JSX } from 'react'
import s from './SuggestionCard.module.css'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TemplateCard, {
    type TemplateCardProps,
} from '@/components/common/card/TemplateCard'

interface SuggestionCardProps {
    title: string
    subtitle: string
    tip: {
        icon: JSX.Element
        title: string
        description: string
    }
    mainSuggestion: TemplateCardProps
    mode?: 'light' | 'dark'
}

export default function SuggestionCard({
    title,
    subtitle,
    tip,
    mainSuggestion,
    mode = 'light',
}: SuggestionCardProps) {
    return (
        <section className={`${s.root} ${s[mode]}`}>
            <header className={s.header}>
                <h3 className={s.title}>{title}</h3>
                <p className={s.subtitle}>{subtitle}</p>
                <span className={s.underline} />
            </header>

            <div className={s.content}>
                <div className={s.tipSection}>
                    <TextHorizontal
                        icon={tip.icon}
                        title={tip.title}
                        description={tip.description}
                        mode="light"
                        iconStyle="flat"
                    />
                </div>
                <div className={s.suggestionSection}>
                    <TemplateCard {...mainSuggestion} mode={mode} />
                </div>
            </div>
        </section>
    )
}
