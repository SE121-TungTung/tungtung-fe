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
    sessionId: string,
    qrToken?: string
): Promise<StudentCheckInResponse> {
    return api<StudentCheckInResponse>(
        `${BASE_URL}/${sessionId}/attendance/self-check-in`,
        {
            method: 'POST',
            body: JSON.stringify({ session_id: sessionId, qr_token: qrToken }),
        }
    )
}

export async function markAttendance(
    sessionId: string,
    items: { student_id: string; status: AttendanceStatus; notes?: string }[]
): Promise<{ success: boolean; message: string }> {
    return api<{ success: boolean; message: string }>(
        `${BASE_URL}/${sessionId}/attendance`,
        {
            method: 'PUT',
            body: JSON.stringify({ items }),
        }
    )
}

export async function generateQrToken(
    sessionId: string
): Promise<{
    success: boolean
    data: { qr_token: string; expires_at: string }
    message: string
}> {
    return api<{
        success: boolean
        data: { qr_token: string; expires_at: string }
        message: string
    }>(`${BASE_URL}/${sessionId}/attendance/qr`, {
        method: 'POST',
    })
}

export interface ClassAttendanceStats {
    class_id: string
    class_name: string
    total_sessions_held: number
    average_attendance_rate: number
    students_below_threshold: number
    total_students: number
}

export interface StudentAttendanceStats {
    student_id: string
    student_name: string
    total_sessions: number
    present_count: number
    absent_count: number
    late_count: number
    excused_count: number
    attendance_rate: number
    is_certificate_eligible: boolean
}

export async function getClassAttendanceStats(
    classId: string
): Promise<ClassAttendanceStats> {
    return api<ClassAttendanceStats>(
        `/api/v1/classes/${classId}/attendance/stats`,
        {
            method: 'GET',
        }
    )
}

export async function getStudentAttendanceStats(
    classId: string
): Promise<StudentAttendanceStats[]> {
    return api<StudentAttendanceStats[]>(
        `/api/v1/classes/${classId}/attendance/students`,
        {
            method: 'GET',
        }
    )
}

export interface AttendanceConfig {
    min_rate_percent: number
    grace_period_min: number
    early_checkin_min: number
    alert_absence_count: number
}

export async function getAttendanceConfig(): Promise<AttendanceConfig> {
    return api<AttendanceConfig>(`/api/v1/attendance/config`, {
        method: 'GET',
    })
}

export async function updateAttendanceConfig(
    data: Partial<AttendanceConfig>
): Promise<AttendanceConfig> {
    return api<AttendanceConfig>(`/api/v1/attendance/config`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}
