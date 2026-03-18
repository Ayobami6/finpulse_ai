export const MOCK_ISSUES = [
    {
        id: 1,
        theme: "Transfer Failed",
        severity: "Critical",
        frequency: 284,
        trend: "UP",
        trendValue: "45%",
        sentiment_score: 1.8,
        correlation_detail: "72% correlation with /api/transfer 500 errors. Peak failures at 2:30 PM daily.",
        root_cause_analysis: "API timeout issues during peak hours. Database connection pool exhaustion.",
        actions: [{ id: 1, summary: "Fix API timeout" }]
    },
    {
        id: 2,
        theme: "Loan Rejected",
        severity: "High",
        frequency: 156,
        trend: "UP",
        trendValue: "28%",
        sentiment_score: 2.5,
        correlation_detail: "Customers confused about rejection reasons. Poor messaging clarity.",
        root_cause_analysis: "Generic rejection messages. No clear next steps provided to customers.",
        actions: [{ id: 2, summary: "Clarify rejection reasons" }]
    },
    {
        id: 3,
        theme: "Account Blocked",
        severity: "Medium",
        frequency: 89,
        trend: "DOWN",
        trendValue: "12%",
        sentiment_score: 2.1,
        correlation_detail: "Fraud detection system too aggressive. False positives increasing.",
        root_cause_analysis: "Overly strict fraud rules. Manual review queue backlog of 48+ hours.",
        actions: [{ id: 3, summary: "Review fraud rules" }]
    },
    {
        id: 4,
        theme: "OTP Not Received",
        severity: "High",
        frequency: 45,
        trend: "STABLE",
        trendValue: "0%",
        sentiment_score: 1.5,
        correlation_detail: "SMS Gateway latency spikes observed in region ap-south-1.",
        root_cause_analysis: "Vendor outage affecting OTP delivery.",
        actions: [{ id: 4, summary: "Switch SMS Vendor" }]
    },
];

export const MOCK_DASHBOARD_DATA = {
    stats: {
        active_issues: { value: 23, trend: "5 from last week", direction: "up" },
        avg_sentiment: { value: "2.8/5", trend: "Below target (3.5)", direction: "down" },
        system_errors: { value: 147, trend: "23% vs yesterday", direction: "up" },
        auto_actions: { value: 12, trend: "Tickets created today", direction: "neutral" }
    },
    top_issues: MOCK_ISSUES.slice(0, 3),
    chart_data: [
        { name: 'Day 1', value: 45 },
        { name: 'Day 5', value: 52 },
        { name: 'Day 10', value: 48 },
        { name: 'Day 15', value: 65 },
        { name: 'Day 20', value: 78 },
        { name: 'Day 25', value: 95 },
        { name: 'Day 30', value: 120 },
    ],
    component_impact: [
        { name: '/api/transfer', value: 145 },
        { name: '/api/loan', value: 89 },
        { name: '/api/auth', value: 56 },
        { name: '/api/account', value: 42 },
        { name: 'Database', value: 35 },
    ],
    customer_segments: [
        { id: 1, name: "High-Value Business Accounts", description: "Avg transaction: $50K+", sentiment_score: 1.9, complaints_count: 127 },
        { id: 2, name: "First-Time Loan Applicants", description: "New to platform", sentiment_score: 2.4, complaints_count: 94 },
        { id: 3, name: "International Transfer Users", description: "Cross-border transactions", sentiment_score: 2.7, complaints_count: 68 },
    ]
};

export const MOCK_CHATS = [
    { id: 1, source: "whatsapp", sender_id: "+123456789", message: "My transfer failed again! Fix this now.", sentiment_score: -0.9, timestamp: "2023-10-27T10:00:00Z" },
    { id: 2, source: "freshchat", sender_id: "user@example.com", message: "How do I reset my password?", sentiment_score: 0.1, timestamp: "2023-10-27T10:05:00Z" },
    { id: 3, source: "whatsapp", sender_id: "+987654321", message: "Great service, thanks!", sentiment_score: 0.8, timestamp: "2023-10-27T10:10:00Z" },
    { id: 4, source: "whatsapp", sender_id: "+1122334455", message: "Why is my account blocked?", sentiment_score: -0.7, timestamp: "2023-10-27T10:15:00Z" },
    { id: 5, source: "freshchat", sender_id: "vip@business.com", message: "We are unable to process bulk payments. Please assist immediately.", sentiment_score: -0.8, timestamp: "2023-10-27T10:20:00Z" },
    { id: 6, source: "whatsapp", sender_id: "+447700900000", message: "Is the app down? I can't login.", sentiment_score: -0.5, timestamp: "2023-10-27T10:25:00Z" },
];

export const MOCK_INTEGRATIONS = [
    {
        id: 1,
        source_type: 'whatsapp',
        api_key: 'wha_1234567890',
        webhook_secret: 'sec_1234567890',
        account_url: 'https://api.whatsapp.com/v1',
        is_active: true,
        last_synced_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        source_type: 'freshchat',
        api_key: 'fch_0987654321',
        webhook_secret: 'sec_0987654321',
        account_url: 'https://api.freshchat.com/v2',
        is_active: true,
        last_synced_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

export const MOCK_TEAM = [
    {
        id: 1,
        name: "Alice Smith",
        email: "alice@example.com",
        department: "Engineering"
    },
    {
        id: 2,
        name: "Bob Jones",
        email: "bob@example.com",
        department: "Support"
    }
];
