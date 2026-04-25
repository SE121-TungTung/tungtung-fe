// ============================================================================
// GA Schedule Optimizer — TypeScript Types
// Maps 1:1 to backend schemas/ga_schedule.py
// ============================================================================

// --- Status Enum ---
export type GARunStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'applied'

// --- Request ---

export interface GAScheduleRequest {
    start_date: string // "YYYY-MM-DD"
    end_date: string // "YYYY-MM-DD"
    class_ids?: string[] | null // null = all active classes

    // GA Hyperparameters
    population_size?: number // 10–500, default 100
    generations?: number // 10–2000, default 300
    crossover_rate?: number // 0–1, default 0.70
    mutation_rate?: number // 0–1, default 0.15

    // Soft constraint weights
    weight_consecutive_limit?: number // default 10
    weight_paired_classes?: number // default 8
    weight_time_preference?: number // default 5
    weight_room_utilization?: number // default 3
    weight_preserve_existing?: number // default 6

    // Optional: paired classes
    paired_class_ids?: string[][] | null // [[classA, classB], ...]
}

// --- Run Responses ---

export interface GARunResponse {
    run_id: string
    status: GARunStatus
    best_fitness: number | null
    hard_violations: number | null
    soft_score: number | null
    total_sessions: number | null
    conflict_count: number | null
    generations_run: number | null
    start_date: string
    end_date: string
    started_at: string | null
    completed_at: string | null
    created_at: string
}

export interface GASessionProposal {
    id: string
    class_id: string
    class_name: string
    teacher_id: string
    teacher_name: string
    room_id: string | null
    room_name: string | null
    session_date: string // "YYYY-MM-DD"
    time_slots: number[]
    start_time: string // "HH:mm:ss"
    end_time: string // "HH:mm:ss"
    lesson_topic: string | null
    is_conflict: boolean
    conflict_details: Record<string, unknown> | null
}

export interface GAConflictInfo {
    conflict_type: string
    entity_id: string | null
    entity_name: string | null
    session_date: string
    time_slots: number[]
    reason: string
}

export interface GARunDetailResponse extends GARunResponse {
    sessions: GASessionProposal[]
    conflicts: GAConflictInfo[]
    statistics: Record<string, unknown>
    config: Record<string, unknown>
}

export interface GAApplyResponse {
    success: boolean
    created_count: number
    message: string
    applied_run_id: string
}

// --- Teacher Unavailability ---

export interface TeacherUnavailabilityCreate {
    teacher_id: string
    unavailable_date?: string | null // required when is_recurring=false
    time_slots?: number[] | null // null = whole day
    reason?: string
    is_recurring?: boolean // default false
    day_of_week?: number | null // 0=Mon..6=Sun, required when is_recurring=true
}

export interface TeacherUnavailabilityResponse {
    id: string
    teacher_id: string
    unavailable_date: string | null
    time_slots: number[] | null
    reason: string | null
    is_recurring: boolean
    day_of_week: number | null
    created_at: string
}

// --- Pagination wrapper (matches BE PaginationResponse) ---
export interface GAPaginationResponse<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
}
