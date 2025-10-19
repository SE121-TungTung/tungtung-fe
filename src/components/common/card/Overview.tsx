import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import ChartBar from '@/assets/Chart Bar.svg'

export default function OverviewSection() {
    return (
        <Card
            title="Tổng quan"
            subtitle="Số liệu phân tích từ các hoạt động gần đây"
            mode="light"
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,1fr)',
                    gap: 12,
                }}
            >
                <StatCard
                    active
                    icon={<img src={ChartBar} alt="chart bar icon" />}
                    title="Điểm danh"
                    subtitle="Tỉ lệ tham gia các buổi học hàng tháng"
                    value="99"
                    unit="%"
                />
                <StatCard
                    title="Điểm hiện tại"
                    subtitle="Điểm đạt được trung bình từ các bài thi"
                    value="4.5"
                />
                <StatCard
                    title="Số bài kiểm tra"
                    subtitle="Số lần làm bài của bạn trên hệ thống"
                    value="124"
                />
            </div>
        </Card>
    )
}
