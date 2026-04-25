/**
 * @deprecated — This page has been replaced by AdminKpiRecordDetailPage.
 * Kept temporarily for backward compatibility.
 * Route changed from /admin/kpi/teacher/:teacherId → /admin/kpi/records/:recordId
 */
import { Navigate } from 'react-router-dom'

export default function AdminTeacherKpiPage() {
    // Redirect to main KPI overview since we can't map teacherId to recordId
    return <Navigate to="/admin/kpi" replace />
}
