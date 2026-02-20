"use client";

import { Save, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import {
    Container,
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Flex,
    Badge,
    Input,
    Icon,
    IconButton,
    Checkbox
} from "@chakra-ui/react";

export default function SettingsPage() {
    return (
        <Container maxW="container.md" py={8}>
            <Box mb={8}>
                <Heading size="lg" mb={2}>Settings</Heading>
                <Text color="gray.500">Manage team access, integrations, and notification preferences.</Text>
            </Box>

            <VStack spacing={6} align="stretch">

                {/* Team Management */}
                <Box bg="white" borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.100" p={6}>
                    <Heading size="md" mb={2}>Team Management</Heading>
                    <Text fontSize="sm" color="gray.500" mb={6}>
                        Manage access for Product, Engineering, and Ops team members.
                    </Text>

                    <VStack spacing={3} align="stretch">
                        {["alice@finpulse.com (Product)", "bob@finpulse.com (Engineering)", "charlie@finpulse.com (Ops)"].map((member, i) => (
                            <Flex key={i} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.100">
                                <Text fontSize="sm" fontWeight="medium" color="gray.700">{member}</Text>
                                <IconButton
                                    aria-label="Delete member"
                                    variant="ghost"
                                    colorScheme="red"
                                    size="xs"
                                >
                                    <Icon as={Trash2} boxSize={4} />
                                </IconButton>
                            </Flex>
                        ))}
                    </VStack>

                    <Button mt={6} w="full" variant="outline" borderStyle="dashed" color="gray.600">
                        <Icon as={Plus} mr={2} boxSize={4} /> Add Team Member
                    </Button>
                </Box>

                {/* Integrations */}
                <Box bg="white" borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.100" p={6}>
                    <Heading size="md" mb={4}>Data Integrations</Heading>
                    <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center" p={4} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.900">WhatsApp Business API</Text>
                                <Text fontSize="xs" color="gray.500" mt={0.5}>Active • Last synced 2m ago</Text>
                            </Box>
                            <Badge colorScheme="green" variant="subtle" px={2.5} py={1} borderRadius="full" display="flex" alignItems="center" gap={1.5}>
                                <Icon as={CheckCircle} boxSize={3.5} /> Connected
                            </Badge>
                        </Flex>
                        <Flex justify="space-between" align="center" p={4} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.900">Freshchat</Text>
                                <Text fontSize="xs" color="gray.500" mt={0.5}>Active • Last synced 5m ago</Text>
                            </Box>
                            <Badge colorScheme="green" variant="subtle" px={2.5} py={1} borderRadius="full" display="flex" alignItems="center" gap={1.5}>
                                <Icon as={CheckCircle} boxSize={3.5} /> Connected
                            </Badge>
                        </Flex>
                    </VStack>
                </Box>

                {/* Notifications */}
                <Box bg="white" borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="gray.100" p={6}>
                    <Heading size="md" mb={4}>Notification Preferences</Heading>
                    <VStack spacing={4} align="stretch">
                        <Flex align="start" gap={3}>
                            <Checkbox
                                id="email-alerts"
                                defaultChecked
                                colorScheme="brand"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Text fontWeight="medium" fontSize="sm">Email Alerts</Text>
                                    <Text fontSize="xs" color="gray.500">Receive emails for High Severity issues immediately.</Text>
                                </Box>
                            </Checkbox>
                        </Flex>
                        <Flex align="start" gap={3}>
                            <Checkbox
                                id="slack-alerts"
                                defaultChecked
                                colorScheme="brand"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Text fontWeight="medium" fontSize="sm">Slack Notifications</Text>
                                    <Text fontSize="xs" color="gray.500">Get notified in #ops-alerts when new issue clusters are detected.</Text>
                                </Box>
                            </Checkbox>
                        </Flex>
                    </VStack>

                    <Flex mt={8} justify="flex-end">
                        <Button colorScheme="purple">
                            <Icon as={Save} mr={2} boxSize={4} /> Save Preferences
                        </Button>
                    </Flex>
                </Box>
            </VStack>
        </Container>
    );
}
