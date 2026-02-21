"use client";

import { useState, useEffect } from "react";
import IssueClusterList from "@/components/dashboard/IssueClusterList";
import { AlertTriangle, Filter, Loader2 } from "lucide-react";
import {
    Container,
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Badge,
    Icon,
    Center,
    Spinner
} from "@chakra-ui/react";
// import axios from "axios";

const MOCK_ISSUES = [
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
] as any[];

import api from "@/services/api";

export default function IssuesPage() {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await api.get("/clusters/");
                setIssues(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching issues:", error);
                setIssues([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    if (loading) {
        return (
            <Center h="100vh">
                <Flex align="center" gap={2} color="gray.500">
                    <Spinner size="md" />
                    <Text>Loading Issues...</Text>
                </Flex>
            </Center>
        )
    }

    return (
        <Container maxW="container.lg" py={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" mb={1} color="gray.900">Detected Issues</Heading>
                    <Text color="gray.500">
                        AI-clustered problems from customer chats and system logs.
                    </Text>
                </Box>
                <Flex gap={3}>
                    <Button variant="outline" size="sm" colorScheme="gray">
                        <Icon as={Filter} mr={2} boxSize={4} /> Filter
                    </Button>
                    <Badge
                        colorScheme="green"
                        variant="subtle"
                        px={3}
                        py={2}
                        borderRadius="lg"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >
                        <Icon as={AlertTriangle} boxSize={4} />
                        {issues.length} Active Clusters
                    </Badge>
                </Flex>
            </Flex>

            <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" p={1}>
                <IssueClusterList clusters={issues} />
            </Box>
        </Container>
    );
}
