import './EducationalBackground.css'

interface EducationalBackgroundProps {
    className?: string
    interactive?: boolean // Keep for backwards compatibility
}

export default function EducationalBackground({
    className = '',
}: EducationalBackgroundProps) {
    return (
        <div className={`edu-bg-container ${className}`} aria-hidden="true">
            {/* Sunlight Beam & Warm Glow Layer */}
            <div className="edu-sunlight-beam" />

            {/* Ambient Gradient Mesh */}
            <div className="edu-gradient-mesh">
                <div className="edu-gradient-orb edu-sun-orb" />
                <div className="edu-gradient-orb edu-accent-orb" />
                <div className="edu-gradient-orb edu-cool-orb" />
            </div>

            {/* Crisp Dotted Grid Overlay */}
            <div className="edu-grid-overlay" />
        </div>
    )
}
