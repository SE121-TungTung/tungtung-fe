import { api } from './api'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
const BASE_URL = '/api/v1/sessions'

export interface AttendanceRecord {
    id: string
    student_id: string
    session_id: string
    status: AttendanceStatus
    remarks?: string
    check_in_time?: string
}

export interface StudentCheckInResponse {
    success: boolean
    message: string
    attendance: AttendanceRecord
}

export async function getSessionAttendance(
    sessionId: string
): Promise<AttendanceRecord[]> {
    return api<AttendanceRecord[]>(`${BASE_URL}/${sessionId}/attendance/`, {
        method: 'GET',
    })
}

export async function selfCheckIn(
    sessionId: string
): Promise<StudentCheckInResponse> {
    return api<StudentCheckInResponse>(
        `${BASE_URL}/${sessionId}/attendance/self-check-in`,
        {
            method: 'POST',
            body: JSON.stringify({ session_id: sessionId }),
        }
    )
}
