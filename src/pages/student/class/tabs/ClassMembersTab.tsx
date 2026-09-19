import { useState } from 'react'
import s from '../Class.module.css'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import MemberList from '../MemberList'
import SearchIcon from '@/assets/Book Search.svg'
import type { ClassMember } from '@/components/common/card/MemberCard'

interface ClassMembersTabProps {
    members: ClassMember[]
}

export default function ClassMembersTab({ members }: ClassMembersTabProps) {
    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [memberFilterRole, setMemberFilterRole] = useState<
        'all' | 'student' | 'teacher'
    >('all')

    return (
        <div className={s.card}>
            <Card
                title={`Thành viên lớp (${members.length})`}
                variant="outline"
                mode="light"
                controls={
                    <div className={s.memberControls}>
                        <InputField
                            placeholder="Tìm kiếm thành viên..."
                            value={memberSearchTerm}
                            onChange={(e) =>
                                setMemberSearchTerm(e.target.value)
                            }
                            leftIcon={<img src={SearchIcon} alt="search" />}
                            variant="glass"
                            mode="light"
                            uiSize="sm"
                        />
                        <select
                            className={s.memberFilterSelect}
                            value={memberFilterRole}
                            onChange={(e) =>
                                setMemberFilterRole(
                                    e.target.value as
                                        'all' | 'student' | 'teacher'
                                )
                            }
                        >
                            <option value="all">Tất cả</option>
                            <option value="student">Học viên</option>
                            <option value="teacher">Giáo viên</option>
                        </select>
                    </div>
                }
            >
                <MemberList
                    key={`${memberSearchTerm}-${memberFilterRole}`}
                    members={members}
                    itemsPerPage={8}
                    searchTerm={memberSearchTerm}
                    filterRole={memberFilterRole}
                />
            </Card>
        </div>
    )
}
