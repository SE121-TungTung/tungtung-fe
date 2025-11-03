import type { NavItem } from '@/components/common/menu/NavigationMenu'
import type { SideMenuItem } from '@/components/common/menu/SideMenuSet'

import ClassIcon from '@/assets/Book 2.svg'
import ExamIcon from '@/assets/Card Question.svg'
import RoadmapIcon from '@/assets/Merge.svg'
import type { Role } from '@/types/auth.ts'

const studentStudyMenu: SideMenuItem[] = [
    { id: 'classes', label: 'Lớp học', icon: <img src={ClassIcon} /> },
    { id: 'exams', label: 'Luyện thi', icon: <img src={ExamIcon} /> },
    { id: 'roadmap', label: 'Lộ trình', icon: <img src={RoadmapIcon} /> },
]

const teacherStudyMenu: SideMenuItem[] = [
    { id: 'classes', label: 'Các lớp dạy', icon: <img src={ClassIcon} /> },
    { id: 'exams', label: 'Quản lý đề thi', icon: <img src={ExamIcon} /> },
]

const commonUserMenu: SideMenuItem[] = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'settings', label: 'Cài đặt' },
    { id: 'help', label: 'Trợ giúp' },
    { id: 'logout', label: 'Đăng xuất' },
]

export const getNavItems = (role: Role, activeHref?: string): NavItem[] => {
    const baseNav: NavItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
        },
        {
            id: 'notifications',
            label: 'Thông báo',
            href: '/notifications',
        },
        {
            id: 'messages',
            label: 'Tin nhắn',
            href: '/messages',
        },
    ]

    if (role === 'student') {
        baseNav.splice(1, 0, {
            id: 'study',
            label: 'Học tập',
            href: '/student/classes',
            dropdownItems: studentStudyMenu,
        })
    }

    if (role === 'teacher') {
        baseNav.splice(1, 0, {
            id: 'teach',
            label: 'Giảng dạy',
            href: '/teacher/classes',
            dropdownItems: teacherStudyMenu,
        })
    }

    if (
        role === 'system_admin' ||
        role === 'center_admin' ||
        role === 'office_admin'
    ) {
        // (Thêm menu cho admin nếu cần)
    }

    if (activeHref) {
        return baseNav.map((item) => ({
            ...item,
            active:
                item.href === activeHref ||
                (item.dropdownItems && item.href?.startsWith(activeHref)),
        }))
    }
    return baseNav
}

export const getUserMenuItems = (role: Role): SideMenuItem[] => {
    return commonUserMenu
}
