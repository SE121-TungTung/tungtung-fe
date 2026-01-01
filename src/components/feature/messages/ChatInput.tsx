import React, { useState, useRef, useEffect } from 'react'
import s from './ChatInput.module.css'
import InputField from '@/components/common/input/InputField'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'

import SendIcon from '@/assets/Send Paper Plane.svg'
import ClipIcon from '@/assets/Attachment.svg'
import EmojiIcon from '@/assets/Action Favourite.svg'
import ButtonCircle from '@/components/common/button/ButtonCircle'

interface ChatInputProps {
    onSendMessage: (text: string) => void
    disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    disabled,
}) => {
    const [text, setText] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const emojiRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiRef.current &&
                !emojiRef.current.contains(event.target as Node)
            ) {
                setShowEmoji(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (disabled) return

        const messageToSend = text.trim()
        if (messageToSend) {
            onSendMessage(messageToSend)
            setText('')
            setShowEmoji(false)
        }
    }

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setText((prev) => prev + emojiData.emoji)
    }

    const handleAttachClick = () => {
        alert(
            'Tính năng gửi file cần tích hợp API Upload (Multipart form) từ Backend.'
        )
    }

    return (
        <div className={s.container}>
            {/* Emoji Picker Popup */}
            {showEmoji && (
                <div className={s.emojiPickerContainer} ref={emojiRef}>
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={300}
                        height={400}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}

            <form className={s.inputWrapper} onSubmit={handleSubmit}>
                <ButtonCircle
                    type="button"
                    variant="outline"
                    size="lg"
                    className={s.iconBtn}
                    onClick={handleAttachClick}
                    disabled={disabled}
                >
                    <img src={ClipIcon} alt="Attach" />
                </ButtonCircle>

                {/* Input Field */}
                <div className={s.inputFieldContainer}>
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

                    {/* Button Emoji inside Input area (optional) or outside */}
                    <button
                        type="button"
                        className={s.emojiBtn}
                        onClick={() => setShowEmoji(!showEmoji)}
                    >
                        <img src={EmojiIcon} alt="Emoji" />
                    </button>
                </div>

                {/* Button Send */}
                <ButtonCircle
                    type="button"
                    variant="outline"
                    size="lg"
                    className={s.sendButton}
                    aria-label="Gửi tin nhắn"
                    disabled={disabled || !text.trim()}
                    onClick={handleSubmit}
                >
                    <img
                        src={SendIcon}
                        alt="Send"
                        style={{ opacity: disabled || !text.trim() ? 0.5 : 1 }}
                    />
                </ButtonCircle>
            </form>
        </div>
    )
}
