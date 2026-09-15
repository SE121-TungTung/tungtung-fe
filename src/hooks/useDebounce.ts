import { useState, useEffect } from 'react'

/**
 * Debounce a value — giá trị trả về chỉ cập nhật sau khi
 * giá trị đầu vào ngừng thay đổi trong `delayMs` mili-giây.
 *
 * Dùng cho thanh tìm kiếm real-time để giảm số lần gọi API.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delayMs)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delayMs])

    return debouncedValue
}
