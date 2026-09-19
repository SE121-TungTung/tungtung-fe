import { api } from './api'

export type SubstitutionStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'APPROVED'
    | 'REJECTED'

export interface SubstitutionRequest {
    id: string
    class_session_id: string
    requesting_teacher_id: string
    target_substitute_id: string | null
    reason: string
    status: SubstitutionStatus
    admin_approval_required: boolean
    resolved_at: string | null
    resolved_by: string | null
    admin_note: string | null
    created_at: string
    updated_at: string | null

    // Relations that backend might supply
    class_session?: {
        id: string
        session_date: string
        start_time: string
        end_time: string
        topic: string
        class_id: string
        class_name?: string
    }
    requesting_teacher_name?: string
    target_substitute_name?: string
}

export interface CreateSubstitutionPayload {
    class_session_id: string
    target_substitute_id?: string | null
    reason: string
}

export async function createSubstitutionRequest(
    payload: CreateSubstitutionPayload
): Promise<SubstitutionRequest> {
    return api<SubstitutionRequest>('/api/v1/substitutions', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function getSubstitutionRequests(): Promise<
    SubstitutionRequest[]
> {
    return api<SubstitutionRequest[]>('/api/v1/substitutions')
}

export async function acceptSubstitution(
    requestId: string
): Promise<SubstitutionRequest> {
    return api<SubstitutionRequest>(
        `/api/v1/substitutions/${requestId}/accept`,
        {
            method: 'POST',
        }
    )
}

export async function declineSubstitution(
    requestId: string
): Promise<SubstitutionRequest> {
    return api<SubstitutionRequest>(
        `/api/v1/substitutions/${requestId}/decline`,
        {
            method: 'POST',
        }
    )
}

export async function approveSubstitution(
    requestId: string,
    targetSubstituteId?: string | null,
    adminNote?: string
): Promise<SubstitutionRequest> {
    const params = new URLSearchParams()
    if (targetSubstituteId)
        params.set('target_substitute_id', targetSubstituteId)
    if (adminNote) params.set('admin_note', adminNote)
    const query = params.toString() ? `?${params.toString()}` : ''
    return api<SubstitutionRequest>(
        `/api/v1/substitutions/${requestId}/approve${query}`,
        {
            method: 'POST',
        }
    )
}

export async function rejectSubstitution(
    requestId: string,
    adminNote?: string
): Promise<SubstitutionRequest> {
    const query = adminNote
        ? `?admin_note=${encodeURIComponent(adminNote)}`
        : ''
    return api<SubstitutionRequest>(
        `/api/v1/substitutions/${requestId}/reject${query}`,
        {
            method: 'POST',
        }
    )
}
