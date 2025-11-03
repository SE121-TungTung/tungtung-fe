import React, { useState } from 'react'
import s from './ChatInput.module.css'
import InputField from '@/components/common/input/InputField'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import SendIcon from '@/assets/Send Paper Plane.svg'

interface ChatInputProps {
    onSendMessage: (text: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const [text, setText] = useState('')

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
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
            >
                <img src={SendIcon} alt="Send" />
            </ButtonGhost>
        </form>
    )
}
