import React from 'react'
import type { IPAPhonemeInfo } from '@/types/pronunciation.types'
import s from './MouthDiagram.module.css'

interface MouthDiagramProps {
    phoneme: IPAPhonemeInfo
    size?: number
}

/**
 * Component vẽ sơ đồ mặt cắt giải phẫu khoang miệng (Sagittal Vocal Tract Diagram)
 * trực quan, sinh động thể hiện vị trí môi, răng, lưỡi, ngạc họng và thanh quản.
 */
export const MouthDiagram: React.FC<MouthDiagramProps> = ({
    phoneme,
    size = 200,
}) => {
    const { mouthDiagramType, voicing } = phoneme

    // Xác định tọa độ hình dáng lưỡi dựa trên loại âm vị
    const getTonguePath = () => {
        switch (mouthDiagramType) {
            case 'close_front': // /iː/, /ɪ/, /e/ - lưỡi nâng cao về phía trước ngạc cứng
                return 'M 60,145 Q 85,140 100,105 Q 115,85 138,82 Q 150,86 160,118 Q 165,140 165,155 Z'
            case 'open_front': // /æ/, /aɪ/ - lưỡi ép dẹt thấp dưới đáy miệng
                return 'M 60,150 Q 90,148 115,135 Q 135,130 155,132 Q 165,142 165,155 Z'
            case 'close_back': // /uː/, /ʊ/ - cuống lưỡi nâng cao về phía ngạc mềm
                return 'M 60,150 Q 80,145 95,130 Q 115,90 135,88 Q 155,105 165,155 Z'
            case 'open_back': // /ɑː/, /ɒ/, /ɔː/ - cuống lưỡi thấp lùi về cuống họng
                return 'M 60,150 Q 85,148 110,142 Q 135,135 155,130 Q 165,145 165,155 Z'
            case 'mid_central': // /ə/, /ɜː/, /ʌ/ - lưỡi thư giãn ở vị trí trung tâm
                return 'M 60,148 Q 85,142 105,120 Q 125,108 145,108 Q 160,125 165,155 Z'
            case 'bilabial': // /p/, /b/, /m/, /w/ - môi mím hoặc chu, lưỡi trung tính
                return 'M 60,148 Q 85,144 110,128 Q 130,118 150,118 Q 162,135 165,155 Z'
            case 'labiodental': // /f/, /v/ - răng trên chạm môi dưới
                return 'M 60,148 Q 85,142 110,125 Q 130,115 150,115 Q 162,135 165,155 Z'
            case 'dental': // /θ/, /ð/ - đầu lưỡi đưa ra giữa hai hàm răng
                return 'M 48,118 Q 70,128 95,125 Q 125,115 150,115 Q 162,135 165,155 Z'
            case 'alveolar': // /t/, /d/, /s/, /z/, /n/, /l/ - đầu lưỡi chạm nướu trên
                return 'M 60,145 Q 75,130 92,92 Q 102,86 118,98 Q 140,112 165,155 Z'
            case 'postalveolar': // /ʃ/, /ʒ/, /tʃ/, /dʒ/, /r/ - thân lưỡi vòm lên sau nướu
                return 'M 60,145 Q 80,135 102,96 Q 120,88 138,94 Q 155,120 165,155 Z'
            case 'velar': // /k/, /ɡ/, /ŋ/ - cuống lưỡi chạm ngạc mềm
                return 'M 60,150 Q 80,145 95,135 Q 120,110 142,75 Q 155,75 165,155 Z'
            default:
                return 'M 60,148 Q 85,142 110,120 Q 130,110 150,110 Q 162,130 165,155 Z'
        }
    }

    // Tọa độ vị trí môi (mở, khép, tròn, hoặc răng chạm môi)
    const getLipsCoordinates = () => {
        if (mouthDiagramType === 'bilabial') {
            // Môi mím chặt
            return {
                upperLip: 'M 35,98 Q 45,98 52,108 Q 46,112 36,108 Z',
                lowerLip: 'M 35,116 Q 46,114 52,110 Q 48,124 36,124 Z',
            }
        }
        if (mouthDiagramType === 'labiodental') {
            // Răng trên chạm môi dưới
            return {
                upperLip: 'M 30,90 Q 44,90 52,98 Q 44,104 30,98 Z',
                lowerLip: 'M 40,112 Q 52,105 56,108 Q 48,126 34,124 Z',
            }
        }
        if (mouthDiagramType === 'close_back' || phoneme.symbol === 'w') {
            // Môi chu tròn về phía trước
            return {
                upperLip: 'M 24,96 Q 38,95 46,102 Q 38,108 24,106 Z',
                lowerLip: 'M 24,116 Q 38,114 46,110 Q 38,124 24,122 Z',
            }
        }
        // Môi mở tự nhiên hoặc bè
        return {
            upperLip: 'M 32,92 Q 44,92 50,100 Q 42,106 32,100 Z',
            lowerLip: 'M 32,120 Q 44,116 50,112 Q 44,128 32,126 Z',
        }
    }

    const lips = getLipsCoordinates()
    const isNasal = ['m', 'n', 'ŋ'].includes(phoneme.symbol)
    const isVoiced = voicing === 'voiced' || voicing === 'vowel'

    return (
        <div className={s.diagramWrapper} style={{ width: size, height: size }}>
            <svg
                viewBox="0 0 200 200"
                className={s.diagramSvg}
                aria-label={`Sơ đồ khẩu hình cho âm ${phoneme.symbol}`}
            >
                <defs>
                    <linearGradient
                        id="tongueGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient
                        id="palateGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#fca5a5" />
                        <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                    <linearGradient
                        id="larynxGlow"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>

                {/* Khung đầu và vòm miệng cố định (Profile Outline) */}
                <path
                    d="M 30,50 Q 55,20 110,20 Q 170,25 175,90 L 175,185 L 165,185 L 165,150 Q 155,75 125,75 Q 85,75 62,88 L 62,100"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Vòm miệng cứng & ngạc mềm (Hard & Soft Palate) */}
                <path
                    d="M 60,94 Q 85,75 115,75 Q 140,75 152,90 Q 156,105 152,112"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="5"
                    strokeLinecap="round"
                />

                {/* Răng cửa trên (Upper incisor) */}
                <path
                    d="M 54,94 L 56,106 L 50,106 Z"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                />

                {/* Răng cửa dưới (Lower incisor) */}
                <path
                    d="M 52,122 L 56,112 L 58,122 Z"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                />

                {/* Môi trên (Upper Lip) */}
                <path
                    d={lips.upperLip}
                    fill="#fb7185"
                    stroke="#e11d48"
                    strokeWidth="1.5"
                />

                {/* Môi dưới (Lower Lip) */}
                <path
                    d={lips.lowerLip}
                    fill="#fb7185"
                    stroke="#e11d48"
                    strokeWidth="1.5"
                />

                {/* Lưỡi (Tongue) với vị trí linh hoạt */}
                <path
                    d={getTonguePath()}
                    fill="url(#tongueGradient)"
                    stroke="#b91c1c"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className={s.tonguePath}
                />

                {/* Đường dẫn khí (Airflow path) */}
                {isNasal ? (
                    // Hơi thoát qua đường mũi
                    <path
                        d="M 160,160 Q 155,110 135,60 Q 95,50 40,65"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        markerEnd="url(#arrow)"
                    />
                ) : (
                    // Hơi thoát qua đường miệng
                    <path
                        d="M 160,165 Q 140,135 110,118 Q 80,110 32,108"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                    />
                )}

                {/* Thanh quản (Larynx / Vocal Cords) */}
                <g transform="translate(155, 168)">
                    {isVoiced ? (
                        <>
                            {/* Dây thanh quản rung (Voiced waves) */}
                            <path
                                d="M 0,0 Q 4,-4 8,0 T 16,0"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 0,6 Q 4,2 8,6 T 16,6"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <text
                                x="-4"
                                y="20"
                                fontSize="9"
                                fill="#f59e0b"
                                fontWeight="bold"
                            >
                                Rung
                            </text>
                        </>
                    ) : (
                        <>
                            {/* Dây thanh quản không rung (Voiceless) */}
                            <line
                                x1="0"
                                y1="3"
                                x2="16"
                                y2="3"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                strokeDasharray="3 2"
                            />
                            <text x="-8" y="20" fontSize="9" fill="#94a3b8">
                                K.Rung
                            </text>
                        </>
                    )}
                </g>

                {/* Ký hiệu âm vị ở góc */}
                <rect
                    x="8"
                    y="8"
                    width="44"
                    height="32"
                    rx="8"
                    fill="rgba(15, 23, 42, 0.75)"
                    stroke="rgba(255, 255, 255, 0.15)"
                />
                <text
                    x="30"
                    y="30"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="18"
                    fontWeight="bold"
                    fontFamily="monospace"
                >
                    {phoneme.symbol}
                </text>
            </svg>
        </div>
    )
}
