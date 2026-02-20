import { Box, Stack, Text, Badge, Flex } from "@chakra-ui/react";

interface CustomerSegment {
    id: number;
    name: string;
    description: string;
    sentiment_score: number; // 0-5 scale
    complaints_count: number;
}

interface CustomerSegmentListProps {
    segments: CustomerSegment[];
}

export default function CustomerSegmentList({ segments }: CustomerSegmentListProps) {
    return (
        <Stack spacing={3}>
            {segments.map((segment) => {
                const isCritical = segment.sentiment_score < 2.5;
                const isWarning = segment.sentiment_score >= 2.5 && segment.sentiment_score < 3.5;

                const bg = isCritical ? 'red.50' : isWarning ? 'orange.50' : 'green.50';
                const borderColor = isCritical ? 'red.100' : isWarning ? 'orange.100' : 'green.100';
                const sentimentColor = isCritical ? 'red.600' : isWarning ? 'orange.600' : 'green.600';

                return (
                    <Box
                        key={segment.id}
                        bg={bg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontWeight="bold" fontSize="sm">
                                    {segment.name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                    {segment.description}
                                </Text>
                            </Box>
                            <Box textAlign="right">
                                <Text color={sentimentColor} fontWeight="bold" fontSize="lg">
                                    {segment.sentiment_score.toFixed(1)}/5
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    <Text as="span" color={sentimentColor} fontWeight="medium" mr={1}>
                                        Sentiment
                                    </Text>
                                    • {segment.complaints_count} Complaints
                                </Text>
                            </Box>
                        </Flex>
                    </Box>
                );
            })}
        </Stack>
    );
}
