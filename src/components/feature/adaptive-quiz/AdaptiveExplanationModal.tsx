import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { SparklesIcon, CheckCircleIcon, TargetIcon } from './AdaptiveIcons'
import styles from './AdaptiveExplanationModal.module.css'

interface AdaptiveHelpButtonProps {
    tooltipText?: string
}

export const AdaptiveHelpButton: React.FC<AdaptiveHelpButtonProps> = ({
    tooltipText = 'Giải thích thêm',
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <span className={styles.helpBtnWrapper}>
                <button
                    type="button"
                    className={styles.helpBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label={tooltipText}
                >
                    ?
                </button>
                <span className={styles.tooltip} role="tooltip">
                    {tooltipText}
                </span>
            </span>

            {isOpen &&
                createPortal(
                    <div
                        className={styles.backdrop}
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className={styles.modal}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="adaptive-help-modal-title"
                        >
                            <div className={styles.modalHeader}>
                                <div className={styles.headerTitleGroup}>
                                    <div className={styles.headerIcon}>
                                        <SparklesIcon size={20} />
                                    </div>
                                    <div>
                                        <h3
                                            id="adaptive-help-modal-title"
                                            className={styles.modalTitle}
                                        >
                                            Cơ Chế Bài Kiểm Tra Năng Lực Thích
                                            Ứng
                                        </h3>
                                        <p className={styles.modalSubtitle}>
                                            Cách hệ thống đánh giá chính xác
                                            Band điểm IELTS của bạn chỉ với
                                            15–20 câu hỏi
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.closeBtn}
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Đóng"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>
                                        <TargetIcon size={18} />
                                        1. Bài kiểm tra thích ứng hoạt động như
                                        thế nào?
                                    </h4>
                                    <p style={{ margin: 0 }}>
                                        Khác với bài thi giấy truyền thống (mọi
                                        học viên đều phải làm cùng một bộ 40 câu
                                        hỏi cố định), bài kiểm tra thích ứng{' '}
                                        <strong>
                                            tự động điều chỉnh độ khó của câu
                                            hỏi tiếp theo
                                        </strong>{' '}
                                        dựa ngay trên câu trả lời vừa rồi của
                                        bạn:
                                    </p>

                                    <div className={styles.stepGrid}>
                                        <div className={styles.stepCard}>
                                            <span className={styles.stepBadge}>
                                                Bước 1
                                            </span>
                                            <div
                                                className={styles.stepCardTitle}
                                            >
                                                Khởi đầu vừa sức
                                            </div>
                                            <p className={styles.stepCardText}>
                                                Hệ thống bắt đầu bằng câu hỏi ở
                                                mức độ trung bình (hoặc dựa trên
                                                trình độ ở lần kiểm tra gần nhất
                                                của bạn).
                                            </p>
                                        </div>

                                        <div className={styles.stepCard}>
                                            <span className={styles.stepBadge}>
                                                Bước 2
                                            </span>
                                            <div
                                                className={styles.stepCardTitle}
                                            >
                                                Tự động tăng / giảm độ khó
                                            </div>
                                            <p className={styles.stepCardText}>
                                                Nếu bạn trả lời{' '}
                                                <strong>Đúng</strong>, câu tiếp
                                                theo sẽ thử thách hơn. Nếu{' '}
                                                <strong>Chưa đúng</strong>, hệ
                                                thống chọn câu vừa sức hơn.
                                            </p>
                                        </div>

                                        <div className={styles.stepCard}>
                                            <span className={styles.stepBadge}>
                                                Bước 3
                                            </span>
                                            <div
                                                className={styles.stepCardTitle}
                                            >
                                                Chốt Band điểm chính xác
                                            </div>
                                            <p className={styles.stepCardText}>
                                                Bài thi tự động kết thúc sớm
                                                ngay khi hệ thống đã xác định đủ
                                                độ tin cậy về trình độ thực tế
                                                của bạn.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>
                                        <CheckCircleIcon size={18} />
                                        2. Ý nghĩa các chỉ số hiển thị trong bài
                                        thi &amp; báo cáo
                                    </h4>
                                    <ul className={styles.infoList}>
                                        <li>
                                            <strong>
                                                Ước lượng IELTS Band (3.5 –
                                                9.0):
                                            </strong>{' '}
                                            Mức điểm IELTS dự kiến của bạn tại
                                            thời điểm hiện tại. Điểm số này phụ
                                            thuộc vào{' '}
                                            <em>
                                                mức độ khó của các câu bạn làm
                                                đúng
                                            </em>
                                            , chứ không chỉ đếm số câu đúng đơn
                                            thuần.
                                        </li>
                                        <li>
                                            <strong>
                                                Điểm năng lực (Thang -3.0 đến
                                                +3.0):
                                            </strong>{' '}
                                            Thước đo chuẩn hóa biểu diễn năng
                                            lực thực chất của bạn (mức 0.0 tương
                                            đương khoảng Band 6.0 – 6.5; càng
                                            dương trình độ càng cao).
                                        </li>
                                        <li>
                                            <strong>
                                                Độ tin cậy / Độ dao động ước
                                                lượng:
                                            </strong>{' '}
                                            Ở những câu đầu tiên, hệ thống còn
                                            đang thăm dò nên khoảng dao động còn
                                            rộng. Càng làm thêm câu hỏi, độ dao
                                            động càng nhỏ lại giúp kết quả Band
                                            điểm hội tụ chính xác.
                                        </li>
                                        <li>
                                            <strong>
                                                Biểu đồ phân tích từng câu hỏi:
                                            </strong>{' '}
                                            Trong trang kết quả, mỗi câu hỏi đều
                                            có biểu đồ đường cong cho biết với
                                            mức năng lực hiện tại của bạn thì
                                            khả năng làm đúng câu hỏi đó là bao
                                            nhiêu phần trăm.
                                        </li>
                                    </ul>
                                </div>

                                <div className={styles.techBox}>
                                    <h5 className={styles.techTitle}>
                                        Góc chuyên môn: Công nghệ khảo thí đằng
                                        sau hệ thống
                                    </h5>
                                    <p className={styles.techText}>
                                        Tính năng này được xây dựng dựa trên mô
                                        hình{' '}
                                        <strong>
                                            Khảo thí thích ứng trên máy tính
                                            (CAT — Computerized Adaptive
                                            Testing)
                                        </strong>{' '}
                                        kết hợp với{' '}
                                        <strong>
                                            Lý thuyết ứng đáp câu hỏi 3 tham số
                                            (3PL IRT — Item Response Theory)
                                        </strong>
                                        . Mỗi câu hỏi trong ngân hàng đề đều
                                        được hiệu chuẩn theo 3 đặc trưng: Độ khó
                                        (<em>b</em>), Độ phân loại học viên (
                                        <em>a</em>) và Xác suất đoán ngẫu nhiên
                                        trắc nghiệm (<em>c</em>). Sau mỗi lượt
                                        trả lời, thuật toán chọn câu hỏi tiếp
                                        theo tối ưu hóa Lượng thông tin Fisher
                                        (Maximum Fisher Information) để rút ngắn
                                        50% thời gian làm bài mà vẫn đảm bảo độ
                                        chính xác tương đương bài thi dài.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.GotItBtn}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Đã hiểu
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    )
}

