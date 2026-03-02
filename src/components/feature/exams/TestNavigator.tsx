import { useState } from 'react'
import type { TestSectionCreatePayload } from '@/types/test.types'
import s from './TestNavigator.module.css'

interface TestNavigatorProps {
    sections: TestSectionCreatePayload[]
    onNavigate: (sectionIndex: number, partIndex?: number) => void
}

export default function TestNavigator({
    sections,
    onNavigate,
}: TestNavigatorProps) {
    const [activeSection, setActiveSection] = useState<number>(0)

    const handleNavClick = (sectionIndex: number, partIndex?: number) => {
        setActiveSection(sectionIndex)
        onNavigate(sectionIndex, partIndex)

        // Scroll to element
        const elementId =
            partIndex !== undefined
                ? `section-${sectionIndex}-part-${partIndex}`
                : `section-${sectionIndex}`
        document.getElementById(elementId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    return (
        <div className={s.navigator}>
            <div className={s.sticky}>
                <h3 className={s.title}>Nội dung bài thi</h3>

                <div className={s.list}>
                    {sections.map((section, sIndex) => (
                        <div key={sIndex} className={s.sectionItem}>
                            <button
                                className={`${s.sectionBtn} ${activeSection === sIndex ? s.active : ''}`}
                                onClick={() => handleNavClick(sIndex)}
                            >
                                <span className={s.badge}>{sIndex + 1}</span>
                                {section.name}
                            </button>

                            {section.parts.length > 0 && (
                                <div className={s.parts}>
                                    {section.parts.map((part, pIndex) => (
                                        <button
                                            key={pIndex}
                                            className={s.partBtn}
                                            onClick={() =>
                                                handleNavClick(sIndex, pIndex)
                                            }
                                        >
                                            <span className={s.dot}>•</span>
                                            {part.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
