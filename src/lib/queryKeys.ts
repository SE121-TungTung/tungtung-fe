// ============================================================================
// CENTRALIZED QUERY KEY FACTORY
// ============================================================================

export const queryKeys = {
    auth: {
        me: ['me'] as const,
    },
    users: {
        all: ['users'] as const,
        list: (params?: unknown) => ['users', 'list', params] as const,
        detail: (id: string) => ['users', 'detail', id] as const,
        myClasses: () => ['users', 'my-classes'] as const,
    },
    classes: {
        all: ['classes'] as const,
        list: (params?: unknown) => ['classes', 'list', params] as const,
        detail: (id: string) => ['classes', 'detail', id] as const,
        posts: (id: string) => ['classes', 'posts', id] as const,
        sessions: (id: string) => ['classes', 'sessions', id] as const,
        attendance: (classId: string, sessionId: string) =>
            ['classes', 'attendance', classId, sessionId] as const,
        certificates: (classId: string) =>
            ['classes', 'certificates', classId] as const,
    },
    finance: {
        all: ['finance'] as const,
        walletBalance: () => ['finance', 'wallet-balance'] as const,
        walletTransactions: (page?: number, limit?: number) =>
            ['finance', 'wallet-transactions', page, limit] as const,
        adminWalletTransactions: (params?: unknown) =>
            ['finance', 'admin-wallet-transactions', params] as const,
        invoices: (params?: unknown) =>
            ['finance', 'invoices', params] as const,
        myInvoices: (page?: number, limit?: number) =>
            ['finance', 'my-invoices', page, limit] as const,
        invoiceDetail: (id: string) => ['finance', 'invoice', id] as const,
        payments: (params?: unknown) =>
            ['finance', 'payments', params] as const,
        paymentReceipt: (id: string) =>
            ['finance', 'payment-receipt', id] as const,
        reports: (params?: unknown) => ['finance', 'reports', params] as const,
    },
    exams: {
        all: ['exams'] as const,
        list: (params?: unknown) => ['exams', 'list', params] as const,
        detail: (id: string) => ['exams', 'detail', id] as const,
        attempts: (testId?: string) => ['exams', 'attempts', testId] as const,
        attemptDetail: (attemptId: string) =>
            ['exams', 'attempt-detail', attemptId] as const,
    },
    kpi: {
        all: ['kpi'] as const,
        records: (params?: unknown) => ['kpi', 'records', params] as const,
        recordDetail: (id: string) => ['kpi', 'record-detail', id] as const,
        templates: () => ['kpi', 'templates'] as const,
        disputes: () => ['kpi', 'disputes'] as const,
        teacherDashboard: () => ['kpi', 'teacher-dashboard'] as const,
    },
    salary: {
        all: ['salary'] as const,
        payrollList: (params?: unknown) =>
            ['salary', 'payroll-list', params] as const,
        payrollRunDetail: (runId: string) =>
            ['salary', 'payroll-run', runId] as const,
        salaryDetail: (salaryId: string) =>
            ['salary', 'detail', salaryId] as const,
        history: () => ['salary', 'history'] as const,
    },
    schedule: {
        all: ['schedule'] as const,
        list: (params?: unknown) => ['schedule', 'list', params] as const,
        gaRuns: () => ['schedule', 'ga-runs'] as const,
        gaRunDetail: (id: string) => ['schedule', 'ga-run', id] as const,
        teacherUnavailability: (teacherId?: string) =>
            ['schedule', 'teacher-unavailability', teacherId] as const,
    },
} as const
