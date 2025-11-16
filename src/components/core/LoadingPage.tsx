import InfiniteScroll from '@/components/effect/InfiniteScroll'
import s from './LoadingPage.module.css'

type Props = {
    title?: string
    subtitle?: string
}

const LABELS = [
    'Đang kiểm tra phiên',
    'Đang đồng bộ',
    'Khởi tạo session',
    'Nạp cấu hình',
    'Xác thực token',
    'Tải dữ liệu',
    'Kết nối máy chủ',
    'Gọi API',
]

export default function LoadingPage({ title, subtitle }: Props) {
    // tạo 24 item để kéo vô hạn
    const items = Array.from({ length: 24 }, (_, i) => ({
        content: (
            <span className={s.itemText}>{LABELS[i % LABELS.length]}</span>
        ),
    }))

    return (
        <div className={s.root}>
            <div className={s.center}>
                <h1 className={s.title}>{title ?? 'Đang xử lý…'}</h1>
                {subtitle ? <p className={s.subtitle}>{subtitle}</p> : null}
            </div>

            {/* Dải “màu mè” chạy vô hạn */}
            <div className={s.scroller}>
                <InfiniteScroll
                    width="42rem"
                    maxHeight="72vh"
                    negativeMargin="-0.85rem"
                    itemMinHeight={88}
                    isTilted
                    tiltDirection="left"
                    autoplay
                    autoplaySpeed={0.6}
                    autoplayDirection="down"
                    pauseOnHover={false}
                    items={items}
                />
            </div>
        </div>
    )
}
