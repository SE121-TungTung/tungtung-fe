import { useNavigate } from 'react-router-dom'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './MemberCard.module.css'

import AvatarPlaceholder from '@/assets/avatar-placeholder.png'
import MessageIcon from '@/assets/Send Paper Plane.svg'

export interface ClassMember {
    id: string
    firstName: string
    lastName: string
    avatarUrl?: string | null
    role: 'student' | 'teacher'
    isOnline: boolean
    email?: string
}

interface MemberCardProps {
    member: ClassMember
}

export default function MemberCard({ member }: MemberCardProps) {
    const navigate = useNavigate()

    const handleSendMessage = () => {
        // Điều hướng đến trang nhắn tin với ID của thành viên
        // Đường dẫn '/student/messages/:userId' là ví dụ
        navigate(`/student/messages/${member.id}`)
        console.log(`Sending message to ${member.firstName} ${member.lastName}`)
    }

    const fullName = `${member.firstName} ${member.lastName}`
    const avatarSrc = member.avatarUrl || AvatarPlaceholder

    return (
        <div className={s.card} title={member.email}>
            <img
                src={avatarSrc}
                alt={`${fullName}'s avatar`}
                className={s.avatar}
            />
            <div className={s.info}>
                <div className={s.nameWrapper}>
                    <h4 className={s.name}>{fullName}</h4>
                    <span
                        className={`${s.statusIndicator} ${member.isOnline ? s.online : s.offline}`}
                        title={member.isOnline ? 'Online' : 'Offline'}
                    />
                </div>
                <p className={s.role}>
                    {member.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                </p>
            </div>
            <div className={s.actions}>
                <ButtonGhost
                    size="sm"
                    mode="light"
                    leftIcon={
                        <img
                            src={MessageIcon}
                            alt="message icon"
                            width={16}
                            height={16}
                        />
                    }
                    onClick={handleSendMessage}
                    className={s.messageButton}
                >
                    Nhắn tin
                </ButtonGhost>
            </div>
        </div>
    )
}
