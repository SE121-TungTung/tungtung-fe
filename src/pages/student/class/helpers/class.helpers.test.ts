import { describe, it, expect } from 'vitest'
import {
    mapClassSessions,
    filterTodaySessions,
    mapClassMembers,
} from './class.helpers'
import type { MyClass } from '@/types/user.types'

describe('class.helpers', () => {
    describe('mapClassSessions', () => {
        it('returns empty array when currentClass is undefined or sessions is empty', () => {
            expect(mapClassSessions(undefined)).toEqual([])
            expect(
                mapClassSessions({ id: 'c1', name: 'Class 1' } as MyClass)
            ).toEqual([])
        })

        it('maps and sorts class sessions chronologically', () => {
            const mockClass = {
                id: 'c1',
                name: 'IELTS Intensive',
                course_name: 'IELTS Course',
                room_name: 'Room 201',
                teacher: { full_name: 'John Doe' },
                sessions: [
                    {
                        id: 's2',
                        session_date: '2026-09-10',
                        start_time: '18:30:00',
                        end_time: '20:30:00',
                        status: 'scheduled',
                        attendance_taken: false,
                    },
                    {
                        id: 's1',
                        session_date: '2026-09-05',
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                        title: 'Orientation',
                        status: 'completed',
                        student_checked_in: true,
                    },
                ],
            } as unknown as MyClass

            const result = mapClassSessions(mockClass)
            expect(result).toHaveLength(2)
            expect(result[0].id).toBe('s1')
            expect(result[0].startTime).toBe('08:00')
            expect(result[0].endTime).toBe('10:00')
            expect(result[0].className).toBe('Orientation')
            expect(result[0].attendanceTaken).toBe(true)

            expect(result[1].id).toBe('s2')
            expect(result[1].startTime).toBe('18:30')
            expect(result[1].className).toBe('Buổi học ngày 2026-09-10')
            expect(result[1].attendanceTaken).toBe(false)
        })
    })

    describe('filterTodaySessions', () => {
        it('filters only sessions matching today date', () => {
            const now = new Date()
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

            const lessons = [
                {
                    id: '1',
                    sessionDate: todayStr,
                    startTime: '08:00',
                    endTime: '10:00',
                    className: 'Today Lesson',
                    courseName: 'Course A',
                    roomName: 'R1',
                    teacherName: 'Teacher A',
                    status: 'scheduled' as const,
                    attendanceTaken: false,
                },
                {
                    id: '2',
                    sessionDate: '2020-01-01',
                    startTime: '08:00',
                    endTime: '10:00',
                    className: 'Past Lesson',
                    courseName: 'Course A',
                    roomName: 'R1',
                    teacherName: 'Teacher A',
                    status: 'completed' as const,
                    attendanceTaken: true,
                },
            ]

            const today = filterTodaySessions(lessons)
            expect(today).toHaveLength(1)
            expect(today[0].id).toBe('1')
        })
    })

    describe('mapClassMembers', () => {
        it('returns empty array when currentClass is undefined', () => {
            expect(mapClassMembers(undefined)).toEqual([])
        })

        it('maps teacher and student members correctly', () => {
            const mockClass = {
                id: 'c1',
                teacher: {
                    id: 't1',
                    full_name: 'Nguyễn Văn Teacher',
                    avatar_url: 'http://example.com/avatar.jpg',
                    email: 'teacher@test.com',
                },
                students: [
                    {
                        id: 'st1',
                        full_name: 'Trần Thị Student',
                        avatar_url: null,
                        email: 'student@test.com',
                    },
                ],
            } as unknown as MyClass

            const members = mapClassMembers(mockClass)
            expect(members).toHaveLength(2)

            expect(members[0].role).toBe('teacher')
            expect(members[0].firstName).toBe('Teacher')
            expect(members[0].lastName).toBe('Nguyễn Văn')
            expect(members[0].isOnline).toBe(true)

            expect(members[1].role).toBe('student')
            expect(members[1].firstName).toBe('Student')
            expect(members[1].lastName).toBe('Trần Thị')
            expect(members[1].isOnline).toBe(false)
        })
    })
})
