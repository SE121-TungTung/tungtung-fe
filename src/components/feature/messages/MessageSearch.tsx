import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import styles from './MessageSearch.module.css'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import CloseIcon from '@/assets/Close X Thin.svg'
import ArrowUpIcon from '@/assets/Arrow Up.svg'
import ArrowDownIcon from '@/assets/Arrow Down.svg'

interface MessageSearchProps {
    roomId: string
    onNavigateToMessage: (messageId: string) => void
    onClose: () => void
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
    roomId,
    onNavigateToMessage,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['searchMessages', roomId, searchQuery],
        queryFn: () =>
            messageApi.searchMessages({
                q: searchQuery,
                room_id: roomId,
                limit: 100,
            }),
        enabled: searchQuery.length > 2,
        staleTime: 10000,
    })

    const results = searchResults?.results || []
    const totalResults = results.length

    const handleNext = () => {
        if (currentIndex < totalResults - 1) {
            const newIndex = currentIndex + 1
            setCurrentIndex(newIndex)
            onNavigateToMessage(results[newIndex].id)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1
            setCurrentIndex(newIndex)
            onNavigateToMessage(results[newIndex].id)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (results.length > 0) {
            setCurrentIndex(0)
            onNavigateToMessage(results[0].id)
        }
    }

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
                <h5 className={styles.searchTitle}>Tìm kiếm tin nhắn</h5>
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.closeBtn}
                    aria-label="Đóng"
                >
                    <img src={CloseIcon} alt="Close" />
                </button>
            </div>

            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchInputWrapper}>
                    <img
                        src={SearchIcon}
                        alt=""
                        className={styles.searchIcon}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentIndex(0)
                        }}
                        placeholder="Tìm trong cuộc trò chuyện..."
                        className={styles.searchInput}
                        autoFocus
                    />
                </div>

                {(searchQuery.length > 2 || results.length > 0) && (
                    <div className={styles.searchResultsBar}>
                        {isLoading ? (
                            <span className={styles.searchStatus}>
                                Đang tìm...
                            </span>
                        ) : totalResults > 0 ? (
                            <>
                                <span className={styles.searchStatus}>
                                    {currentIndex + 1} của {totalResults} kết
                                    quả
                                </span>
                                <div className={styles.searchNav}>
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                        className={styles.navBtn}
                                        title="Kết quả cũ hơn (Lên)"
                                    >
                                        <img src={ArrowUpIcon} alt="Up" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={
                                            currentIndex === totalResults - 1
                                        }
                                        className={styles.navBtn}
                                        title="Kết quả mới hơn (Xuống)"
                                    >
                                        <img src={ArrowDownIcon} alt="Down" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <span className={styles.searchStatus}>
                                Không tìm thấy
                            </span>
                        )}
                    </div>
                )}
            </form>

            {results.length > 0 && (
                <div className={styles.resultList}>
                    {results.map((msg, index) => (
                        <button
                            key={msg.id}
                            type="button"
                            onClick={() => {
                                setCurrentIndex(index)
                                onNavigateToMessage(msg.id)
                            }}
                            className={`${styles.resultItem} ${
                                index === currentIndex ? styles.active : ''
                            }`}
                        >
                            <div className={styles.resultContent}>
                                <p className={styles.resultText}>
                                    {msg.content}
                                </p>
                                <span className={styles.resultTime}>
                                    {new Date(msg.createdAt).toLocaleDateString(
                                        'vi-VN'
                                    )}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
