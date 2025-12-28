// ----------------------------------------------------------------------------
// Time Slot Configuration (System-wide)
// ----------------------------------------------------------------------------
export interface TimeSlot {
    slot_number: number // 1-6
    start_time: string // "08:00:00"
    end_time: string // "09:30:00"
}

export const SYSTEM_TIME_SLOTS: TimeSlot[] = [
    { slot_number: 1, start_time: '08:00:00', end_time: '09:30:00' },
    { slot_number: 2, start_time: '09:45:00', end_time: '11:15:00' },
    { slot_number: 3, start_time: '13:00:00', end_time: '14:30:00' },
    { slot_number: 4, start_time: '14:45:00', end_time: '16:15:00' },
    { slot_number: 5, start_time: '18:00:00', end_time: '19:30:00' },
    { slot_number: 6, start_time: '19:45:00', end_time: '21:15:00' },
]

// ----------------------------------------------------------------------------
// Base Session Types
// ----------------------------------------------------------------------------
export type SessionStatus =
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'

export interface SessionBase {
    class_id: string
    class_name: string
    teacher_id: string
    teacher_name: string
    room_id: string
    room_name: string
    session_date: string // "YYYY-MM-DD"
    start_time: string // "HH:mm:ss"
    end_time: string // "HH:mm:ss"
    time_slots: number[] // [1, 2]
    lesson_topic?: string | null
}

export interface SessionProposal extends SessionBase {
    // Used in generate response - không có id (chưa lưu DB)
    id?: string
}

export interface SessionResponse extends SessionBase {
    id: string // UUID - có khi đã lưu DB
    topic: string | null
    status: SessionStatus
    created_at: string // ISO datetime
}

// ----------------------------------------------------------------------------
// Conflict Management
// ----------------------------------------------------------------------------
export type ConflictType =
    | 'teacher_busy'
    | 'room_unavailable'
    | 'no_slots'
    | 'max_slot_violation'
    | 'request_class_conflict'
    | 'request_teacher_conflict'

export interface ConflictSuggestion {
    type: 'time_shift' | 'date_shift'
    date: string // "YYYY-MM-DD"
    time_slots: number[]
    start_time?: string
    end_time?: string
    room_id?: string
}

export interface ConflictInfo {
    class_id: string
    class_name: string
    conflict_type: ConflictType
    session_date: string
    time_slots: number[]
    reason: string // Detailed explanation
    suggestions: ConflictSuggestion[]
}

// ----------------------------------------------------------------------------
// Generate Schedule (UC MF.3)
// ----------------------------------------------------------------------------
export interface ScheduleGenerateRequest {
    start_date: string // "YYYY-MM-DD"
    end_date: string // "YYYY-MM-DD"
    class_ids?: string[] // null = all active classes
    max_slots_per_session?: number // 1-4, default: 2
    prefer_morning?: boolean // default: true

    // Hard constraints - Forbidden time slots
    class_conflict?: Record<string, Record<string, number[]>>
    // Example: { "class-uuid": { "2024-01-15": [1, 2] } }

    teacher_conflict?: Record<string, Record<string, number[]>>
    // Example: { "teacher-uuid": { "2024-01-15": [3, 4] } }
}

export interface ScheduleGenerateResponse {
    total_classes: number
    successful_sessions: number
    conflict_count: number

    sessions: SessionProposal[]
    conflicts: ConflictInfo[]

    statistics: {
        success_rate: number // 0-100
    }
}

// ----------------------------------------------------------------------------
// Apply Schedule (UC MF.5)
// ----------------------------------------------------------------------------
export interface ScheduleApplyRequest {
    // Copy entire response from /generate
    total_classes: number
    successful_sessions: number
    conflict_count: number
    sessions: SessionProposal[]
    conflicts: ConflictInfo[]
    statistics: Record<string, any>
}

export interface ScheduleApplyResponse {
    success: boolean
    created_count: number
    message: string
}

// ----------------------------------------------------------------------------
// Manual Session CRUD (UC MF.3.1, 3.3, 3.4)
// ----------------------------------------------------------------------------
export interface SessionCreateRequest {
    class_id: string // Required
    session_date: string // "YYYY-MM-DD"
    time_slots: number[] // [1, 2] - min 1, max 4 items
    room_id?: string // null = AI auto-select
    teacher_id?: string // null = use class teacher
    topic?: string
    notes?: string
}

export interface SessionUpdateRequest {
    session_date?: string
    time_slots?: number[]
    room_id?: string
    teacher_id?: string // Substitute teacher
    topic?: string
    notes?: string
    status?: SessionStatus
}

export interface SessionDeleteResponse {
    success: boolean
    message: string
}

// ----------------------------------------------------------------------------
// Weekly Schedule View (UC MF.4)
// ----------------------------------------------------------------------------
export interface WeeklyScheduleFilter {
    start_date?: string // "YYYY-MM-DD" - default: current week
    end_date?: string // "YYYY-MM-DD"
    class_id?: string // Filter by class
    user_id?: string // Filter by teacher/student
}

export interface WeeklySession {
    session_id: string
    class_name: string
    teacher_name: string
    room_name: string
    session_date: string // "YYYY-MM-DD"
    day_of_week: string // "Monday", "Tuesday"...
    start_time: string // "08:00:00"
    end_time: string // "09:30:00"
    topic: string | null
}

export interface WeeklyScheduleResponse {
    schedule: WeeklySession[]
}

// ----------------------------------------------------------------------------
// Helper Types
// ----------------------------------------------------------------------------
export interface DateRange {
    start: string // "YYYY-MM-DD"
    end: string // "YYYY-MM-DD"
}

export interface TimeRange {
    start: string // "HH:mm:ss"
    end: string // "HH:mm:ss"
}

// ----------------------------------------------------------------------------
// Error Types
// ----------------------------------------------------------------------------
export interface APIError {
    message: string
    detail?:
        | string
        | Array<{
              loc: string[]
              msg: string
              type: string
          }>
    status?: number
}
