import OverviewSection from '@/components/common/card/Overview'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import TemplateCard from '@/components/common/card/TemplateCard'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import LessonItem from '@/components/common/typography/LessonItem'
import ChatIcon from '@/assets/Chat Square Question.svg'

export function Dashboard({ label = 'Dashboard' }: { label?: string }) {
    const dailyTasks = [
        {
            id: 1,
            image: 'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/396e9/MainBefore.jpg',
            tag: 'Speaking',
            title: 'How to pronounce /ed/ sound?',
            excerpt:
                'This is the sample text. Real information will be added later when developing this website.',
            ctaText: 'Go to Youtube',
            link: 'https://youtube.com',
        },
        {
            id: 2,
            tag: 'Listening',
            image: 'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/396e9/MainBefore.jpg',
            title: 'Practice listening with TED Talks',
            excerpt:
                'Listen and fill in the blanks. This exercise helps improve your listening comprehension skills.',
            ctaText: 'Start lesson',
            link: '#',
        },
        {
            id: 3,
            tag: 'Listening',
            image: 'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/396e9/MainBefore.jpg',
            title: 'Practice listening with TED Talks',
            excerpt:
                'Listen and fill in the blanks. This exercise helps improve your listening comprehension skills.',
            ctaText: 'Start lesson',
            link: '#',
        },
    ]

    return (
        <div
            style={{
                padding: 24,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            <NavigationMenu></NavigationMenu>
            Welcome {label}
            <OverviewSection></OverviewSection>
            <LessonItem
                id={'123'}
                sessionDate={'12/10'}
                startTime={'3h'}
                endTime={'5h'}
                className={'L07'}
                courseName="IELTS 7+"
                roomName="Phòng A1"
                teacherName="Nguyễn Văn A"
                status="scheduled"
                attendanceTaken={false}
            ></LessonItem>
            <div style={{ maxWidth: 600 }}>
                <ScheduleTodayCard
                    sessions={[
                        {
                            id: '1',
                            sessionDate: '2025-03-10',
                            startTime: '08:00',
                            endTime: '09:30',
                            className: 'IELTS Intermediate A',
                            courseName: 'IELTS Intermediate A',
                            teacherName: 'Mr. John',
                            roomName: 'A1',
                            status: 'in_progress',
                            attendanceTaken: false,
                        },
                    ]}
                    onCheckIn={() => alert('Checked in!')}
                    mode="light"
                ></ScheduleTodayCard>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                {dailyTasks.map((task) => (
                    <TemplateCard
                        key={task.id}
                        mode="light"
                        image={task.image}
                        tag={
                            <>
                                <img
                                    src={ChatIcon}
                                    alt="tag icon"
                                    width={14}
                                    height={14}
                                />
                                <span>{task.tag}</span>
                            </>
                        }
                        title={task.title}
                        excerpt={task.excerpt}
                        ctaText={task.ctaText}
                        ctaIcon={
                            <img
                                src={ChatIcon}
                                alt="cta icon"
                                width={14}
                                height={14}
                            />
                        }
                        onCta={() => window.open(task.link, '_blank')}
                    />
                ))}
            </div>
        </div>
    )
}
