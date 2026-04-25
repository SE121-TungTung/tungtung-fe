import { KpiTierConfigTable } from './KpiTierConfigTable'
import s from '../users/UserManagementPage.module.css'

export default function KpiTiersSettingsPage() {
    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Cấu hình Hạng thưởng KPI</h1>
                <KpiTierConfigTable />
            </main>
        </div>
    )
}
