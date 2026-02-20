"use client";

import { TrendingUp, TrendingDown, BarChart2, Clock } from "lucide-react";
import { Card, CardBody, Text, Badge, HStack, Button, Box, Divider, Stack, Icon } from "@chakra-ui/react";

interface Action {
    id: number;
    summary: string;
}

export interface IssueCluster {
    id: number;
    theme: string;
    description?: string;
    frequency: number;
    trend: "UP" | "DOWN" | "STABLE";
    trendValue?: string; // e.g. "45%"
    sentiment_score: number;
    correlation_detail: string; // e.g. "72% correlation with /api/transfer 500 errors"
    root_cause_analysis: string;
    actions: Action[];
    severity: "Critical" | "High" | "Medium" | "Low";
}

interface IssueCardProps {
    cluster: IssueCluster;
}

export default function IssueCard({ cluster }: IssueCardProps) {
    const severityColorMap: Record<string, string> = {
        Critical: "red",
        High: "orange",
        Medium: "blue",
        Low: "gray",
    };

    const sentimentColor =
        cluster.sentiment_score < -0.5 ? "red.500" :
            cluster.sentiment_score < 0 ? "orange.500" :
                "green.500";

    return (
        <Card variant="outline" bg="white">
            <CardBody p={4}>
                {/* Header */}
                <Stack direction="row" justify="space-between" align="flex-start" mb={2}>
                    <Stack direction="row" align="center" spacing={2}>
                        <Text fontSize="lg" fontWeight="bold">
                            {cluster.theme}
                        </Text>
                        <Badge
                            colorScheme={severityColorMap[cluster.severity]}
                            variant="solid"
                        >
                            {cluster.severity}
                        </Badge>
                        {cluster.trend === "UP" && (
                            <HStack spacing={1} color="red.500">
                                <Icon as={TrendingUp} boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold">
                                    {cluster.trendValue || "Rising"}
                                </Text>
                            </HStack>
                        )}
                        {cluster.trend === "DOWN" && (
                            <HStack spacing={1} color="green.500">
                                <Icon as={TrendingDown} boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold">
                                    {cluster.trendValue || "Falling"}
                                </Text>
                            </HStack>
                        )}
                    </Stack>
                </Stack>

                {/* Correlation Detail */}
                <Box mb={2}>
                    <Text fontSize="sm" color="gray.600">
                        {cluster.correlation_detail || "Analyzing correlation data..."}
                    </Text>
                </Box>

                {/* Stats Row */}
                <HStack spacing={4} mb={2} align="center">
                    <HStack spacing={1}>
                        <Icon as={BarChart2} boxSize={4} color="blue.500" />
                        <Text fontSize="sm" fontWeight="medium">
                            {cluster.frequency} complaints
                        </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium" color={sentimentColor}>
                        Sentiment: {cluster.sentiment_score.toFixed(1)}/5
                    </Text>
                    <HStack spacing={1} color="gray.500">
                        <Icon as={Clock} boxSize={4} />
                        <Text fontSize="sm">
                            Last 7 days
                        </Text>
                    </HStack>
                </HStack>

                <Divider my={3} />

                {/* Root Cause */}
                <Box mb={3}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                        Root Cause:
                    </Text>
                    <Text fontSize="sm" color="gray.800">
                        {cluster.root_cause_analysis || "No root cause identified yet."}
                    </Text>
                </Box>

                {/* Actions */}
                <HStack spacing={2} mt={2}>
                    <Button variant="outline" size="sm">
                        View Details
                    </Button>
                    <Button variant="outline" size="sm" colorScheme="green">
                        Create Ticket
                    </Button>
                    <Button variant="outline" size="sm" colorScheme="blue">
                        Send Alert
                    </Button>
                </HStack>
            </CardBody>
        </Card>
    );
}
