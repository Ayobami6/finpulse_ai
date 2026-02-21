"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
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
    Checkbox,
    FormControl,
    FormLabel,
    Select,
    useToast,
    Divider,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from "@chakra-ui/react";
import { integrationService, IntegrationConfig } from "@/services/integrationService";

export default function SettingsPage() {
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Form state
    const [formData, setFormData] = useState<IntegrationConfig>({
        source_type: 'freshchat',
        api_key: '',
        webhook_secret: '',
        account_url: '',
        is_active: true
    });

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const data = await integrationService.getIntegrations();
            setIntegrations(data);
        } catch (error) {
            console.error("Error fetching integrations:", error);
            toast({
                title: "Error",
                description: "Failed to load integrations.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const handleSave = async () => {
        try {
            await integrationService.saveIntegration(formData);
            toast({
                title: "Success",
                description: "Integration saved successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            fetchIntegrations();
            setFormData({
                source_type: 'freshchat',
                api_key: '',
                webhook_secret: '',
                account_url: '',
                is_active: true
            });
        } catch (error) {
            console.error("Error saving integration:", error);
            toast({
                title: "Error",
                description: "Failed to save integration.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this integration?")) return;
        try {
            await integrationService.deleteIntegration(id);
            toast({
                title: "Deleted",
                description: "Integration removed.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchIntegrations();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete integration.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

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
                    <Flex justify="space-between" align="center" mb={4}>
                        <Box>
                            <Heading size="md">Data Integrations</Heading>
                            <Text fontSize="sm" color="gray.500">Connect external data sources for analysis.</Text>
                        </Box>
                        <Button size="sm" colorScheme="purple" leftIcon={<Plus size={16} />} onClick={onOpen}>
                            Add Source
                        </Button>
                    </Flex>

                    {loading ? (
                        <Flex justify="center" py={4}><Spinner /></Flex>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {integrations.length === 0 ? (
                                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>No active integrations. Add one to start pulling data.</Text>
                            ) : (
                                integrations.map((integration) => (
                                    <Flex key={integration.id} justify="space-between" align="center" p={4} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
                                        <Box>
                                            <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                                                {integration.source_type === 'freshchat' ? 'Freshchat' : 'WhatsApp'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                                                {integration.is_active ? 'Active' : 'Inactive'} • Last synced {integration.last_synced_at ? new Date(integration.last_synced_at).toLocaleString() : 'Never'}
                                            </Text>
                                            <Text fontSize="xs" color="gray.400">{integration.account_url}</Text>
                                        </Box>
                                        <HStack>
                                            <Badge colorScheme={integration.is_active ? "green" : "gray"} variant="subtle" px={2.5} py={1} borderRadius="full" display="flex" alignItems="center" gap={1.5}>
                                                <Icon as={integration.is_active ? CheckCircle : AlertCircle} boxSize={3.5} /> {integration.is_active ? "Connected" : "Disconnected"}
                                            </Badge>
                                            <IconButton
                                                aria-label="Delete integration"
                                                variant="ghost"
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => integration.id && handleDelete(integration.id)}
                                            >
                                                <Icon as={Trash2} boxSize={4} />
                                            </IconButton>
                                        </HStack>
                                    </Flex>
                                ))
                            )}
                        </VStack>
                    )}
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
                        <Button colorScheme="purple" leftIcon={<Save size={18} />}>
                            Save Preferences
                        </Button>
                    </Flex>
                </Box>
            </VStack>

            {/* Add Integration Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Data Source</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Source Type</FormLabel>
                                <Select
                                    value={formData.source_type}
                                    onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
                                >
                                    <option value="freshchat">Freshchat</option>
                                    <option value="whatsapp">WhatsApp Business</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>API Key</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Enter API Key"
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Account URL</FormLabel>
                                <Input
                                    placeholder="https://example.freshchat.com"
                                    value={formData.account_url}
                                    onChange={(e) => setFormData({ ...formData, account_url: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleSave}>Save Integration</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

