/**
 * Utility: Tải tệp tin về máy giữ nguyên tên file gốc và phần mở rộng.
 *
 * Khắc phục triệt để hạn chế của trình duyệt khi tải tệp từ CDN cross-origin (như Cloudinary):
 * Thuộc tính HTML5 <a download="..."> bị trình duyệt bỏ qua với liên kết cross-origin.
 * Giải pháp: Dùng fetch() lấy blob về local -> tạo same-origin blob URL -> kích hoạt thẻ a.download.
 */

export async function downloadFileWithOriginalName(
    url: string,
    fileName: string
): Promise<void> {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error ${response.status}`)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(blobUrl)
        }, 150)
    } catch {
        // Fallback mở trực tiếp nếu có lỗi
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
        }, 150)
    }
}
