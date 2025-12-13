export interface SessionBase {
    id?: string // Có thể null nếu chưa lưu DB
    class_id: string
    class_name?: string
    room_id?: string
    room_name?: string
    teacher_id: string
    teacher_name?: string
    session_date: string // YYYY-MM-DD
    start_time: string // HH:mm:ss
    end_time: string // HH:mm:ss
    time_slots?: number[] // [1, 2]
    lesson_topic?: string
    status: 'scheduled' | 'completed' | 'cancelled'
    conflict?: boolean
}

export interface ScheduleGenerateRequest {
    class_conflict?: Record<string, Record<string, number[]>>
    teacher_conflict?: Record<string, Record<string, number[]>>
    start_date: string
    end_date: string
    class_ids: string[]
    max_slots_per_session?: number // Mặc định 1 (số kíp/buổi)
    prefer_morning?: boolean // Ưu tiên buổi sáng
}

export interface ScheduleGenerateResponse {
    total_classes: number
    successful_sessions: number
    conflict_count: number
    sessions: SessionBase[]
    conflicts: any[]
    statistics: {
        success_rate: number
    }
}

export interface ScheduleApplyRequest extends ScheduleGenerateRequest {
    sessions: SessionBase[]
}

export interface WeeklyScheduleFilter {
    start_date: string
    end_date: string
    class_id?: string
    teacher_id?: string
}
