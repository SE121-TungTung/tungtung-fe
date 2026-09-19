import { api } from './api'

export interface CertificateEligibility {
    enrollment_id: string
    student_id: string
    student_name: string
    class_name: string
    attendance_rate: number
    min_rate_required: number
    final_grade: number | null
    min_grade_required: number
    is_eligible: boolean
    certificate_code: string | null
    certificate_url: string | null
    is_issued: boolean
}

export async function getClassCertificateEligibility(
    classId: string
): Promise<CertificateEligibility[]> {
    return api<CertificateEligibility[]>(
        `/api/v1/classes/${classId}/attendance/certificate-eligibility`
    )
}

export interface IssueCertificatePayload {
    student_id: string
    course_id: string
    class_id?: string
    certificate_code?: string
    issue_date?: string
    certificate_url?: string
    final_score?: number
    attendance_rate?: number
}

export async function issueCertificate(
    payload: IssueCertificatePayload
): Promise<any> {
    return api<any>('/api/v1/certificates', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}
