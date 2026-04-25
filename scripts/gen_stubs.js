const fs = require('fs');
const path = require('path');

const components = [
    { dir: 'src/pages/admin/kpi', name: 'KpiTiersSettingsPage.tsx' },
    { dir: 'src/pages/admin/kpi', name: 'AdminKpiOverviewPage.tsx' },
    { dir: 'src/pages/admin/kpi', name: 'AdminKpiCalculationPage.tsx' },
    { dir: 'src/pages/admin/kpi', name: 'AdminTeacherKpiPage.tsx' },
    { dir: 'src/pages/admin/salary', name: 'AdminPayrollListPage.tsx' },
    { dir: 'src/pages/admin/salary', name: 'AdminPayrollRunPage.tsx' },
    { dir: 'src/pages/admin/salary', name: 'AdminSalaryDetailPage.tsx' },
    { dir: 'src/pages/teacher/kpi', name: 'TeacherKpiDashboard.tsx' },
    { dir: 'src/pages/teacher/salary', name: 'TeacherSalaryHistoryPage.tsx' },
    { dir: 'src/pages/teacher/salary', name: 'TeacherSalaryDetailPage.tsx' },
];

for (const comp of components) {
    const fullDir = path.join(__dirname, comp.dir);
    if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
    }
    const fullPath = path.join(fullDir, comp.name);
    const componentName = comp.name.replace('.tsx', '');
    const content = `import React from 'react';\n\nexport default function ${componentName}() {\n    return <div>${componentName} Stub</div>;\n}\n`;
    fs.writeFileSync(fullPath, content);
    console.log('Created', fullPath);
}
