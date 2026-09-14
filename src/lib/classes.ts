import { api } from '@/lib/api'

const CLASSES_API_URL = '/api/v1/classes'

export type ClassStatus =
    | 'scheduled'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'postponed'
    | 'draft'
    | 'open'
    | 'ongoing'

export type BackendClass = {
    id: string
    name: string
    course_id: string
    teacher_id: string
    substitute_teacher_id?: string | null
    substitute_teacher_name?: string | null
    room_id: string
    status: ClassStatus
    start_date: string
    end_date: string
    preferred_slots: any
    unavailable_slots: any
    max_students: number
    current_students: number
    fee_amount?: number | string | null
    sessions_per_week?: number | null
    notes?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string | null
    created_by?: string
    updated_by?: string
    course_name?: string
    teacher_name?: string
    room_name?: string
}

export type Class = {
    id: string
    name: string
    course: { id: string; name: string }
    teacher: { id: string; name: string }
    room: { id: string; name: string }
    substituteTeacher?: { id: string; name: string } | null
    status: ClassStatus
    startDate: string
    endDate: string
    preferredSlots: any
    unavailableSlots: any
    maxStudents: number
    currentStudents: number
    feeAmount?: number | null
    sessionsPerWeek?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

const mapClass = (c: BackendClass): Class => ({
    id: c.id,
    name: c.name,
    course: { id: c.course_id, name: c.course_name || c.course_id },
    teacher: { id: c.teacher_id, name: c.teacher_name || c.teacher_id },
    room: { id: c.room_id, name: c.room_name || c.room_id },
    substituteTeacher: c.substitute_teacher_id
        ? {
              id: c.substitute_teacher_id,
              name: c.substitute_teacher_name || c.substitute_teacher_id,
          }
        : null,
    status: c.status,
    startDate: c.start_date ? c.start_date.split('T')[0] : '',
    endDate: c.end_date ? c.end_date.split('T')[0] : '',
    preferredSlots: c.preferred_slots || [],
    unavailableSlots: c.unavailable_slots || [],
    maxStudents: c.max_students,
    currentStudents: c.current_students,
    feeAmount: c.fee_amount ? Number(c.fee_amount) : null,
    sessionsPerWeek: c.sessions_per_week,
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
})

export interface ListClassesParams {
    page?: number
    limit?: number
    search?: string
    status?: ClassStatus | ''
    courseId?: string
    teacherId?: string
    sortBy?: string
    sortDir?: string
}

type PaginatedResponse<T> = {
    items: T[]
    total: number
    page: number
    size: number
    pages: number
    has_next?: boolean
    has_prev?: boolean
}

export const listClasses = async (
    params: ListClassesParams = {}
): Promise<PaginatedResponse<Class>> => {
    const {
        page = 1,
        limit = 10,
        search = '',
        status,
        courseId,
        teacherId,
        sortBy,
        sortDir = 'desc',
    } = params

    const queryParams = new URLSearchParams()
    queryParams.append('skip', '0')
    queryParams.append('limit', '100')
    if (search) queryParams.append('search', search)

    const url = `${CLASSES_API_URL}?${queryParams.toString()}`
    const res = await api<any>(url, { method: 'GET' })

    const rawItems: BackendClass[] =
        res.data ?? res.items ?? (Array.isArray(res) ? res : [])
    let items = rawItems.map(mapClass)

    if (status) {
        items = items.filter((c) => c.status === status)
    }
    if (courseId) {
        items = items.filter((c) => c.course.id === courseId)
    }
    if (teacherId) {
        items = items.filter((c) => c.teacher.id === teacherId)
    }

    if (sortBy) {
        items.sort((a: any, b: any) => {
            const valA = a[sortBy] || ''
            const valB = b[sortBy] || ''
            if (sortDir === 'asc') return valA > valB ? 1 : -1
            return valA < valB ? 1 : -1
        })
    }

    const total = items.length
    const startIndex = (page - 1) * limit
    const paginatedItems = items.slice(startIndex, startIndex + limit)

    return {
        items: paginatedItems,
        total: total,
        page: page,
        size: limit,
        pages: Math.ceil(total / limit),
    }
}

export type CreateClassDto = {
    name: string
    course_id: string
    teacher_id: string
    substitute_teacher_id?: string | null
    room_id: string
    status: ClassStatus
    start_date: string
    end_date: string
    preferred_slots: any
    unavailable_slots: any
    max_students: number
    current_students?: number
    fee_amount?: number | string | null
    sessions_per_week?: number | null
    notes?: string | null
}

export async function createClass(body: CreateClassDto): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return mapClass(res)
}

export type UpdateClassDto = Partial<CreateClassDto>

export async function updateClass(
    id: string,
    body: UpdateClassDto
): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    return mapClass(res)
}

export async function deleteClass(id: string): Promise<void> {
    await api(`${CLASSES_API_URL}/${id}`, {
        method: 'DELETE',
    })
}

export async function getClass(id: string): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/${id}`, {
        method: 'GET',
    })
    return mapClass(res)
}

export async function getTeacherClasses(): Promise<Class[]> {
    const res = await api<any>(`/api/v1/teacher/classes`, {
        method: 'GET',
    })
    const rawItems: BackendClass[] =
        res.data ?? res.items ?? (Array.isArray(res) ? res : [])
    return rawItems.map(mapClass)
}

// ─── Class Posts ──────────────────────────────────────────────────────────────

export interface ClassPostAttachment {
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
}

/** Phân loại tài liệu học tập — map 1-1 với MaterialCategory enum phía BE */
export type MaterialCategory =
    'lecture_slide' | 'exercise' | 'reference' | 'audio' | 'video' | 'other'

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
    lecture_slide: 'Slide bài giảng',
    exercise: 'Bài tập',
    reference: 'Tài liệu tham khảo',
    audio: 'Audio',
    video: 'Video',
    other: 'Khác',
}

export interface ClassPost {
    id: string
    class_id: string
    author_id: string
    title: string
    content?: string
    post_type: 'announcement' | 'material'
    /** Phân loại tài liệu — chỉ có khi post_type = 'material' */
    material_category?: MaterialCategory
    attachments: ClassPostAttachment[]
    /** Bài đang được ghim (tối đa 3 bài / lớp) */
    is_pinned: boolean
    pinned_at?: string
    is_comment_locked: boolean
    /** True nếu bài viết đã từng được chỉnh sửa */
    is_edited: boolean
    created_at: string
    updated_at: string
    author?: {
        id: string
        full_name: string
        role: string
        avatar_url?: string | null
    }
    // ─── Phase 2: Comments & Reactions ──────────────────────────────────────
    comment_count?: number
    reactions_summary?: ReactionsSummary | null
}

/**
 * Lấy danh sách bài viết của lớp.
 * Hỗ trợ filter theo post_type: 'announcement' | 'material'
 * Bài ghim luôn đứng đầu (BE đã sort).
 */
export async function getClassPosts(
    classId: string,
    page = 1,
    limit = 20,
    postType?: 'announcement' | 'material'
): Promise<{ data: ClassPost[]; total: number }> {
    let url = `/api/v1/classes/${classId}/posts?page=${page}&limit=${limit}`
    if (postType) url += `&post_type=${postType}`

    const res = await api<any>(url, { method: 'GET' })

    const items = res?.data ?? res?.items ?? (Array.isArray(res) ? res : [])
    const total = res?.total ?? items.length
    return { data: items, total }
}

/** Tạo bài viết mới (cả Announcement và Material đều hỗ trợ đính kèm file). */
export async function createClassPost(
    classId: string,
    formData: FormData
): Promise<ClassPost> {
    return await api<ClassPost>(`/api/v1/classes/${classId}/posts`, {
        method: 'POST',
        body: formData,
    })
}

/** Chỉnh sửa nội dung bài viết. Chỉ tác giả (hoặc Admin) được phép. */
export async function updateClassPost(
    classId: string,
    postId: string,
    formData: FormData
): Promise<ClassPost> {
    return await api<ClassPost>(`/api/v1/classes/${classId}/posts/${postId}`, {
        method: 'PUT',
        body: formData,
    })
}

/**
 * Ghim hoặc bỏ ghim bài viết.
 *
 * @param forceUnpinOldest - Nếu true và đang ở giới hạn 3 bài ghim,
 *   tự động bỏ ghim bài cũ nhất rồi ghim bài này
 *   (dùng sau khi user confirm PinLimitModal).
 */
export async function pinClassPost(
    classId: string,
    postId: string,
    pin: boolean,
    forceUnpinOldest = false
): Promise<ClassPost> {
    return await api<ClassPost>(
        `/api/v1/classes/${classId}/posts/${postId}/pin`,
        {
            method: 'PATCH',
            body: JSON.stringify({ pin, force_unpin_oldest: forceUnpinOldest }),
        }
    )
}

/** Soft-delete bài viết (dữ liệu vẫn còn trong DB). */
export async function deleteClassPost(
    classId: string,
    postId: string
): Promise<void> {
    await api(`/api/v1/classes/${classId}/posts/${postId}`, {
        method: 'DELETE',
    })
}

// ─── Phase 2: Reactions ───────────────────────────────────────────────────────

export type ReactionType = 'like' | 'heart' | 'understood'

export interface ReactionsSummary {
    like: number
    heart: number
    understood: number
    /** Các reaction mà current_user đang active trên bài viết này */
    user_reactions: ReactionType[]
}

export interface ReactionToggleResponse {
    action: 'added' | 'removed'
    reaction_type: ReactionType
    summary: ReactionsSummary
}

/** Toggle reaction trên bài viết. Click lần 1 = thêm, lần 2 = bỏ (cùng type). */
export async function togglePostReaction(
    classId: string,
    postId: string,
    reactionType: ReactionType
): Promise<ReactionToggleResponse> {
    return await api<ReactionToggleResponse>(
        `/api/v1/classes/${classId}/posts/${postId}/reactions`,
        {
            method: 'POST',
            body: JSON.stringify({ reaction_type: reactionType }),
        }
    )
}

/** Khóa / mở bình luận cho bài viết. Chỉ GV/TA/Admin được phép. */
export async function lockPostComments(
    classId: string,
    postId: string,
    isLocked: boolean
): Promise<ClassPost> {
    return await api<ClassPost>(
        `/api/v1/classes/${classId}/posts/${postId}/lock-comments`,
        {
            method: 'PATCH',
            body: JSON.stringify({ is_comment_locked: isLocked }),
        }
    )
}

// ─── Phase 2: Comments ────────────────────────────────────────────────────────

export interface CommentAuthor {
    id: string
    full_name: string
    role: string
    avatar_url?: string | null
}

export interface ClassPostComment {
    id: string
    post_id: string
    author_id: string
    author?: CommentAuthor
    parent_comment_id?: string | null
    content: string
    is_edited: boolean
    created_at: string
    updated_at: string
    /** Replies (chỉ có ở top-level comments — lồng tối đa 1 cấp) */
    replies: ClassPostComment[]
}

/** Lấy danh sách bình luận của 1 bài viết (top-level + replies). */
export async function getPostComments(
    classId: string,
    postId: string,
    page = 1,
    limit = 50
): Promise<{ data: ClassPostComment[]; total: number }> {
    const url = `/api/v1/classes/${classId}/posts/${postId}/comments?page=${page}&limit=${limit}`
    const res = await api<any>(url, { method: 'GET' })
    const items = res?.data ?? res?.items ?? (Array.isArray(res) ? res : [])
    const total = res?.total ?? items.length
    return { data: items, total }
}

/** Tạo bình luận mới hoặc reply. */
export async function createPostComment(
    classId: string,
    postId: string,
    data: { content: string; parent_comment_id?: string | null }
): Promise<ClassPostComment> {
    return await api<ClassPostComment>(
        `/api/v1/classes/${classId}/posts/${postId}/comments`,
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    )
}

/** Chỉnh sửa nội dung bình luận. Chỉ tác giả được phép. */
export async function updatePostComment(
    classId: string,
    postId: string,
    commentId: string,
    data: { content: string }
): Promise<ClassPostComment> {
    return await api<ClassPostComment>(
        `/api/v1/classes/${classId}/posts/${postId}/comments/${commentId}`,
        {
            method: 'PUT',
            body: JSON.stringify(data),
        }
    )
}

/** Xóa mềm bình luận. */
export async function deletePostComment(
    classId: string,
    postId: string,
    commentId: string
): Promise<void> {
    await api(
        `/api/v1/classes/${classId}/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE' }
    )
}
