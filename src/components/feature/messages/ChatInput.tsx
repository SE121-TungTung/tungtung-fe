import React, { useState } from 'react'
import s from './ChatInput.module.css'
import InputField from '@/components/common/input/InputField'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import SendIcon from '@/assets/Send Paper Plane.svg'

interface ChatInputProps {
    onSendMessage: (text: string) => void
    disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    disabled,
}) => {
    const [text, setText] = useState('')

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (disabled) return

        const messageToSend = text.trim()
        if (messageToSend) {
            onSendMessage(messageToSend)
            setText('')
        }
    }

    return (
        <form className={s.inputWrapper} onSubmit={handleSubmit}>
            <InputField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                variant="soft"
                mode="light"
                fullWidth
                disabled={disabled}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                    }
                }}
            />
            <ButtonGhost
                type="submit"
                size="md"
                className={s.sendButton}
                aria-label="Gửi tin nhắn"
                disabled={disabled}
            >
                <img
                    src={SendIcon}
                    alt="Send"
                    style={{ opacity: disabled ? 0.5 : 1 }}
                />
            </ButtonGhost>
        </form>
    )
}
