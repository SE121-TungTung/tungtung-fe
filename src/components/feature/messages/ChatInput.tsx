import { useState } from 'react'
import InputField from '@/components/common/input/InputField'
import { Button } from '@/components/core/Button'
import ButtonCircle from '@/components/common/button/ButtonCircle'
import styles from './ChatInput.module.css'

interface ChatInputProps {
    onSend: (text: string) => void
}

// Giả sử bạn có SVG icons hoặc component Icon
// import { PaperclipIcon, SmileIcon, SendIcon } from '@/components/core/Icons'

export function ChatInput({ onSend }: ChatInputProps) {
    const [text, setText] = useState('')

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (text.trim()) {
            onSend(text.trim())
            setText('')
        }
    }

    return (
        <form className={styles.wrapper} onSubmit={handleSend}>
            {/* Nút đính kèm (cải tiến) */}
            <ButtonCircle
                type="button"
                onClick={() => alert('Đính kèm file')}
                aria-label="Đính kèm file"
            >
                {<span>📎</span>}
            </ButtonCircle>
            {/* Nút icon (cải tiến) */}
            <ButtonCircle
                type="button"
                onClick={() => alert('Chọn icon')}
                aria-label="Chọn biểu cảm"
            >
                {<span>🙂</span>}
            </ButtonCircle>

            {/* Ô nhập liệu */}
            <InputField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className={styles.inputField}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        handleSend(e)
                    }
                }}
            />

            {/* Nút gửi - Tái sử dụng Button core */}
            <Button
                type="submit"
                className={styles.sendButton}
                disabled={!text.trim()}
            >
                Gửi
                {/* Hoặc dùng Icon: <SendIcon /> */}
            </Button>
        </form>
    )
}
