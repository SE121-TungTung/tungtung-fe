import React from 'react'
import InputField from '@/components/common/input/InputField'
import SearchIcon from '@/assets/Book Search.svg'
import MemberList from '@/pages/student/class/MemberList'
import { type ClassMember } from '@/components/common/card/MemberCard'

interface ClassMembersTabProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    classMembers: ClassMember[]
}

export const ClassMembersTab: React.FC<ClassMembersTabProps> = ({
    searchTerm,
    setSearchTerm,
    classMembers,
}) => {
    return (
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
                <InputField
                    placeholder="Tìm kiếm học viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<img src={SearchIcon} alt="" />}
                />
            </div>

            <MemberList
                members={classMembers}
                searchTerm={searchTerm}
                filterRole="student"
            />
        </div>
    )
}

export default ClassMembersTab
