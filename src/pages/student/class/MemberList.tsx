import { useState, useMemo } from 'react'
import MemberCard, {
    type ClassMember,
} from '@/components/common/card/MemberCard'
import Pagination from '@/components/common/menu/Pagination'
import s from './MemberList.module.css'

interface MemberListProps {
    members: ClassMember[]
    itemsPerPage?: number
    searchTerm: string
    filterRole: 'all' | 'student' | 'teacher'
}

export default function MemberList({
    members = [],
    itemsPerPage = 6,
    searchTerm,
    filterRole,
}: MemberListProps) {
    const [currentPage, setCurrentPage] = useState(0)

    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const nameMatch = `${member.firstName} ${member.lastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            const roleMatch = filterRole === 'all' || member.role === filterRole
            return nameMatch && roleMatch
        })
    }, [members, searchTerm, filterRole])

    const pageCount = Math.ceil(filteredMembers.length / itemsPerPage)
    const paginatedMembers = useMemo(() => {
        const startIndex = currentPage * itemsPerPage
        return filteredMembers.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredMembers, currentPage, itemsPerPage])

    const handlePageChange = (pageIndex: number) => {
        setCurrentPage(pageIndex)
    }

    return (
        <div className={s.container}>
            {paginatedMembers.length > 0 ? (
                <div className={s.list}>
                    {paginatedMembers.map((member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </div>
            ) : (
                <div className={s.emptyState}>
                    <p>Không tìm thấy thành viên nào phù hợp.</p>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={pageCount}
                onPageChange={handlePageChange}
            />
        </div>
    )
}
