"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import IssueTrendChart from "@/components/dashboard/IssueTrendChart";
import ComponentImpactChart from "@/components/dashboard/ComponentImpactChart";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import CustomerSegmentList from "@/components/dashboard/CustomerSegmentList";
import {
    AlertTriangle,
    TrendingUp,
    Users,
    BarChart,
    Zap,
    Smile,
    ArrowRight
} from "lucide-react";
import {
    Container,
    SimpleGrid,
    Heading,
    Text,
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Icon,
    Spinner,
    Center,
    Grid
} from "@chakra-ui/react";
// import axios from "axios";

// Mock data for initial render
const MOCK_DATA = {
    stats: {
        active_issues: { value: 23, trend: "5 from last week", direction: "up" },
        avg_sentiment: { value: "2.8/5", trend: "Below target (3.5)", direction: "down" },
        system_errors: { value: 147, trend: "23% vs yesterday", direction: "up" },
        auto_actions: { value: 12, trend: "Tickets created today", direction: "neutral" }
    },
    top_issues: [
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
    ],
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

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In production, we would use real API
                // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                // const response = await axios.get(`${apiUrl}/dashboard/executive_summary/`);
                // setData(response.data);

                // For UI dev, use Mock Data
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
                setData(MOCK_DATA);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setData(MOCK_DATA);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Center height="100vh">
                <Spinner size="xl" color="brand.500" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" py={4}>
            <Box mb={8}>
                <Heading as="h1" size="lg" mb={2}>
                    Executive Dashboard
                </Heading>
                <Text color="gray.500">
                    Real-time insights across support, product, and engineering
                </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
                {/* Stats Cards */}
                <StatsCard
                    title="Active Issues"
                    value={data.stats.active_issues.value}
                    icon={<Icon as={AlertTriangle} color="red.500" boxSize={6} />}
                    trend={data.stats.active_issues.trend}
                    trendDirection={data.stats.active_issues.direction as any}
                />
                <StatsCard
                    title="Avg Sentiment"
                    value={data.stats.avg_sentiment.value}
                    icon={<Icon as={Smile} color="orange.500" boxSize={6} />}
                    trend={data.stats.avg_sentiment.trend}
                    trendDirection={data.stats.avg_sentiment.direction as any}
                />
                <StatsCard
                    title="System Errors"
                    value={data.stats.system_errors.value}
                    icon={<Icon as={BarChart} color="blue.500" boxSize={6} />}
                    trend={data.stats.system_errors.trend}
                    trendDirection={data.stats.system_errors.direction as any}
                />
                <StatsCard
                    title="Auto Actions"
                    value={data.stats.auto_actions.value}
                    icon={<Icon as={Zap} color="brand.500" boxSize={6} />}
                    trend={data.stats.auto_actions.trend}
                    trendDirection={data.stats.auto_actions.direction as any}
                />
            </SimpleGrid>

            {/* Top 5 Issues */}
            <Box mb={6}>
                <Card bg="white" variant="outline">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Flex align="center" gap={2}>
                                <Icon as={AlertTriangle} color="red.500" boxSize={5} />
                                <Heading size="md">Top 5 Issues This Week</Heading>
                            </Flex>
                            <Button size="sm" variant="outline" colorScheme="gray">
                                View All Issues <Icon as={ArrowRight} ml={2} boxSize={4} />
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <IssueClusterList clusters={data.top_issues} />
                    </CardBody>
                </Card>
            </Box>

            {/* Charts Section */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
                <Card bg="white" variant="outline" h="full">
                    <CardHeader>
                        <Flex align="center" gap={2}>
                            <Icon as={TrendingUp} color="gray.500" boxSize={5} />
                            <Heading size="md">Issue Trends (Last 30 Days)</Heading>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <IssueTrendChart data={data.chart_data} />
                    </CardBody>
                </Card>

                <Card bg="white" variant="outline" h="full">
                    <CardHeader>
                        <Flex align="center" gap={2}>
                            <Icon as={BarChart} color="gray.500" boxSize={5} />
                            <Heading size="md">Most Affected Components</Heading>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <ComponentImpactChart data={data.component_impact} />
                    </CardBody>
                </Card>
            </Grid>

            {/* Customer Segments */}
            <Box>
                <Card bg="white" variant="outline">
                    <CardHeader>
                        <Flex align="center" gap={2}>
                            <Icon as={Users} color="orange.500" boxSize={5} />
                            <Heading size="md">Most Affected Customer Segments</Heading>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <CustomerSegmentList segments={data.customer_segments} />
                    </CardBody>
                </Card>
            </Box>
        </Container>
    );
}
