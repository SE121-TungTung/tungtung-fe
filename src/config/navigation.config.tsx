import type { NavItem } from '@/components/common/menu/NavigationMenu'
import type { SideMenuItem } from '@/components/common/menu/SideMenuSet'
import type { Role } from '@/types/auth.ts'
import type { NavigateFunction } from 'react-router-dom'
import IconLogout from '@/assets/Action Dislike.svg'
import { UnreadBadge } from '@/components/feature/messages/UnreadBadge'
import { ThemeSwitcher } from '@/components/common/theme/ThemeSwitcher'

type ExtendedSideMenuItem = SideMenuItem & {
    allowedRoles?: Role[]
    href?: string
}

type AppNavItem = NavItem & {
    allowedRoles?: Role[]
    dropdownItems?: ExtendedSideMenuItem[]
}

const studyMenuItems: ExtendedSideMenuItem[] = [
    {
        id: 'classes',
        label: 'Lớp học',
        href: '/student/class',
    },
    {
        id: 'exams',
        label: 'Luyện thi',
        href: '/student/tests',
    },
    {
        id: 'roadmap',
        label: 'Lộ trình',
        href: '/coming-soon',
    },
]

const studentNavItems: AppNavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
    },
    {
        id: 'study',
        label: 'Học tập',
        dropdownItems: studyMenuItems,
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
    {
        id: 'finance',
        label: 'Tài chính / Hóa đơn',
        href: '/student/finance/invoices',
    },
]

const teacherNavItems: AppNavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
    },
    {
        id: 'classes',
        label: 'Các lớp dạy',
        href: '/teacher/classes',
    },
    {
        id: 'exams',
        label: 'Quản lý đề thi',
        dropdownItems: [
            {
                id: 'create-test',
                label: 'Tạo đề thi mới',
                href: '/teacher/tests/create',
            },
            {
                id: 'manage-tests',
                label: 'Quản lý đề thi',
                href: '/teacher/tests',
            },
        ],
    },
    {
        id: 'messages',
        label: 'Tin nhắn',
        href: '/messages',
    },
    {
        id: 'personal',
        label: 'Cá nhân',
        dropdownItems: [
            {
                id: 'kpi',
                label: 'KPI của tôi',
                href: '/teacher/kpi',
            },
            {
                id: 'salary',
                label: 'Lịch sử lương',
                href: '/teacher/salary',
            },
        ],
    },
]

const adminNavItems: AppNavItem[] = [
    {
        id: 'dashboard',
        label: 'Tổng quan',
        href: '/dashboard',
        allowedRoles: ['office_admin', 'center_admin', 'system_admin'],
    },
    {
        id: 'management',
        label: 'Quản lí chung',
        allowedRoles: ['office_admin', 'center_admin', 'system_admin'],
        dropdownItems: [
            {
                id: 'users',
                label: 'Quản lý người dùng',
                href: '/admin/users',
            },
            {
                id: 'rooms',
                label: 'Quản lý phòng học',
                href: '/admin/rooms',
            },
            {
                id: 'courses',
                label: 'Quản lý khóa học',
                href: '/admin/courses',
            },
            {
                id: 'classes',
                label: 'Quản lý lớp học',
                href: '/admin/classes',
            },
            {
                id: 'schedules',
                label: 'Quản lý lịch học',
                href: '/admin/schedule',
            },
            {
                id: 'schedule-ga',
                label: 'Xếp TKB (GA)',
                href: '/admin/schedule/ga',
            },
            {
                id: 'kpi-payroll',
                label: 'KPI & Lương',
                subItems: [
                    {
                        id: 'kpi',
                        label: 'Quản lý KPI',
                        href: '/admin/kpi',
                    },
                    {
                        id: 'kpi-templates',
                        label: 'Template KPI',
                        href: '/admin/kpi/templates',
                    },
                    {
                        id: 'kpi-support-calc',
                        label: 'Hỗ trợ tính A1/A2',
                        href: '/admin/kpi/support-calc',
                    },
                    {
                        id: 'salary',
                        label: 'Quản lý Lương',
                        href: '/admin/payroll',
                    },
                ],
            },
            {
                id: 'finance',
                label: 'Tài chính',
                subItems: [
                    {
                        id: 'invoices',
                        label: 'Quản lý Tài chính',
                        href: '/admin/finance/invoices',
                    },
                    {
                        id: 'finance-reports',
                        label: 'Báo cáo Tài chính',
                        href: '/admin/finance/reports',
                    },
                ],
            },
        ],
    },
    {
        id: 'system',
        label: 'Hệ thống',
        allowedRoles: ['office_admin', 'center_admin', 'system_admin'],
        dropdownItems: [
            {
                id: 'chatbot-documents',
                label: 'Tài liệu Chatbot',
                href: '/admin/system/chatbot-documents',
                allowedRoles: ['system_admin', 'center_admin'],
            },
            {
                id: 'audit-logs',
                label: 'Nhật ký hệ thống',
                href: '/admin/audit-logs',
                allowedRoles: ['system_admin', 'center_admin'],
            },
        ],
    },
    {
        id: 'messages',
        label: 'Tin nhắn',
        href: '/messages',
        allowedRoles: ['office_admin', 'center_admin', 'system_admin'],
        rightIcon: <UnreadBadge />,
    },
]

const commonUserMenu: ExtendedSideMenuItem[] = [
    {
        id: 'theme-switcher',
        label: <ThemeSwitcher />,
        onClick: (e) => e?.stopPropagation(), // Prevent close popup
    },
    {
        id: 'profile',
        label: 'Hồ sơ',
        href: '/profile',
    },
    {
        id: 'settings',
        label: 'Cài đặt',
        href: '/settings',
    },
    {
        id: 'help',
        label: 'Trợ giúp',
        href: '/coming-soon',
    },
    {
        id: 'logout',
        label: 'Đăng xuất',
        href: '/logout',
    },
]

export const getNavItems = (
    role: Role,
    activeHref: string | undefined,
    navigate: NavigateFunction
): NavItem[] => {
    let navs: AppNavItem[] = []

    switch (role) {
        case 'student':
            navs = studentNavItems
            break
        case 'teacher':
            navs = teacherNavItems
            break
        case 'office_admin':
        case 'center_admin':
        case 'system_admin':
            navs = adminNavItems.filter(
                (route) =>
                    !route.allowedRoles || route.allowedRoles.includes(role)
            )
            break
        default:
            navs = []
    }

    return navs.map((item): NavItem => {
        const { dropdownItems, rightIcon, ...restOfItem } = item

        const mapSubItem = (sub: ExtendedSideMenuItem): SideMenuItem => {
            const { href, subItems, ...restOfSub } =
                sub as ExtendedSideMenuItem & {
                    subItems?: ExtendedSideMenuItem[]
                }
            return {
                ...restOfSub,
                ...(href ? { onClick: () => navigate(href) } : {}),
                ...(subItems ? { subItems: subItems.map(mapSubItem) } : {}),
            }
        }

        const finalDropdownItems = (
            dropdownItems as ExtendedSideMenuItem[] | undefined
        )
            ?.filter(
                (sub) => !sub.allowedRoles || sub.allowedRoles.includes(role)
            )
            .map(mapSubItem)

        return {
            ...restOfItem,
            rightIcon,
            active:
                item.href === activeHref ||
                (finalDropdownItems &&
                    finalDropdownItems.some(
                        (sub) => (sub as any).href === activeHref
                    )),
            dropdownItems: finalDropdownItems,
        }
    })
}

export const getUserMenuItems = (
    role: Role,
    navigate: NavigateFunction
): SideMenuItem[] => {
    let menu: ExtendedSideMenuItem[] = []

    switch (role) {
        case 'student':
        case 'teacher':
        case 'office_admin':
        case 'center_admin':
        case 'system_admin':
            menu = commonUserMenu
            break
        default:
            menu = [
                {
                    id: 'logout',
                    label: 'Đăng xuất',
                    icon: <img src={IconLogout} alt="Logout" />,
                    href: '/logout',
                },
            ]
    }

    return menu.map((item) => {
        const { href, ...restOfItem } = item
        return {
            ...restOfItem,
            onClick: () => href && navigate(href),
        }
    })
}
