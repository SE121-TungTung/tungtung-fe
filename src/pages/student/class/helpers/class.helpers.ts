import type { MyClass, ClassSession, MyClassUser } from '@/types/user.types'
import type { Lesson } from '@/components/common/typography/LessonItem'
import type { ClassMember } from '@/components/common/card/MemberCard'

/**
 * Map sessions từ API MyClass sang format Lesson phục vụ hiển thị UI
 */
export function mapClassSessions(currentClass?: MyClass): Lesson[] {
    if (!currentClass || !currentClass.sessions) return []

    return currentClass.sessions
        .map((session: ClassSession) => ({
            id: session.id,
            sessionDate: session.session_date,
            startTime: session.start_time.slice(0, 5), // '08:00:00' -> '08:00'
            endTime: session.end_time.slice(0, 5),
            className: session.title || `Buổi học ngày ${session.session_date}`,
            courseName: currentClass.course_name || currentClass.name,
            roomName: currentClass.room_name || 'Đang cập nhật',
            teacherName: currentClass.teacher?.full_name || 'Giáo viên',
            status: session.status as 'scheduled' | 'completed' | 'cancelled',
            attendanceTaken:
                session.student_checked_in ?? session.attendance_taken,
        }))
        .sort(
            (a: Lesson, b: Lesson) =>
                new Date(a.sessionDate).getTime() -
                new Date(b.sessionDate).getTime()
        )
}

/**
 * Lọc ra các buổi học trong ngày hôm nay
 */
export function filterTodaySessions(allSessions: Lesson[]): Lesson[] {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return allSessions.filter((s) => s.sessionDate === today)
}

/**
 * Map danh sách giảng viên & học viên sang format ClassMember
 */
export function mapClassMembers(currentClass?: MyClass): ClassMember[] {
    if (!currentClass) return []
    const members: ClassMember[] = []

    // Teacher
    if (currentClass.teacher) {
        members.push({
            id: currentClass.teacher.id,
            firstName: currentClass.teacher.full_name
                .split(' ')
                .slice(-1)
                .join(' '),
            lastName: currentClass.teacher.full_name
                .split(' ')
                .slice(0, -1)
                .join(' '),
            role: 'teacher',
            isOnline: true,
            avatarUrl: currentClass.teacher.avatar_url || null,
            email: currentClass.teacher.email,
        })
    }

    // Students
    if (currentClass.students && Array.isArray(currentClass.students)) {
        currentClass.students.forEach((student: MyClassUser) => {
            members.push({
                id: student.id,
                firstName: student.full_name.split(' ').slice(-1).join(' '),
                lastName: student.full_name.split(' ').slice(0, -1).join(' '),
                role: 'student',
                isOnline: false,
                avatarUrl: student.avatar_url || null,
                email: student.email,
            })
        })
    }

    return members
}
