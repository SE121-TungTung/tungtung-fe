import { useEffect, useRef } from 'react'

interface UsePostViewTrackerOptions {
    /** Ref trỏ tới phần tử Card bài viết */
    elementRef: React.RefObject<HTMLElement | null>
    /** Callback được gọi khi bài viết lưu lại trên viewport đủ thời gian quy định */
    onViewed: () => void | Promise<unknown>
    /** Thời gian tối thiểu (ms) bài viết cần nằm trong viewport. Mặc định: 2000ms */
    durationMs?: number
    /** Tỷ lệ phần tử xuất hiện trong viewport để tính là hiển thị (0.0 - 1.0). Mặc định: 0.4 */
    threshold?: number
    /** Bật/tắt theo dõi (ví dụ chỉ bật cho học viên, tắt cho GV/TA). Mặc định: true */
    isEnabled?: boolean
}

/**
 * Hook tự động ghi nhận lượt xem (View Tracking) khi một bài viết nằm trong viewport
 * người dùng liên tục ít nhất `durationMs` (mặc định 2 giây).
 *
 * Chỉ kích hoạt 1 lần duy nhất cho mỗi vòng đời render của bài viết (hasViewed flag).
 */
export function usePostViewTracker({
    elementRef,
    onViewed,
    durationMs = 2000,
    threshold = 0.4,
    isEnabled = true,
}: UsePostViewTrackerOptions): void {
    const hasViewedRef = useRef<boolean>(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onViewedRef = useRef(onViewed)

    // Luôn giữ tham chiếu callback mới nhất mà không làm re-trigger effect
    useEffect(() => {
        onViewedRef.current = onViewed
    }, [onViewed])

    useEffect(() => {
        if (!isEnabled || hasViewedRef.current) {
            return
        }

        const element = elementRef.current
        if (!element || typeof IntersectionObserver === 'undefined') {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (!entry) return

                if (entry.isIntersecting && !hasViewedRef.current) {
                    // Bài viết xuất hiện trong viewport -> khởi động timer
                    if (!timerRef.current) {
                        timerRef.current = setTimeout(() => {
                            if (!hasViewedRef.current) {
                                hasViewedRef.current = true
                                void onViewedRef.current()
                            }
                            timerRef.current = null
                        }, durationMs)
                    }
                } else {
                    // Bài viết bị cuộn ra khỏi viewport trước khi đủ thời gian -> hủy timer
                    if (timerRef.current) {
                        clearTimeout(timerRef.current)
                        timerRef.current = null
                    }
                }
            },
            {
                threshold,
            }
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [elementRef, durationMs, threshold, isEnabled])
}
