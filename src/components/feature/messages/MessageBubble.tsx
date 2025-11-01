import { useState } from 'react'
import clsx from 'clsx'
import type { Message } from '@/pages/messages/mockData'
import styles from './MessageBubble.module.css'
import ButtonCircle from '@/components/common/button/ButtonCircle'

interface MessageBubbleProps {
    message: Message
    isSentByCurrentUser: boolean
}

export function MessageBubble({
    message,
    isSentByCurrentUser,
}: MessageBubbleProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={clsx(
                styles.wrapper,
                isSentByCurrentUser ? styles.sent : styles.received
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.bubble}>
                <p className={styles.text}>{message.text}</p>
                <span className={styles.timestamp}>{message.timestamp}</span>

                {isHovered && (
                    <ButtonCircle
                        className={styles.reactionButton}
                        onClick={() => alert('React!')}
                        size="sm"
                    >
                        {<span>🙂</span>}
                    </ButtonCircle>
                )}
            </div>
        </div>
    )
}
