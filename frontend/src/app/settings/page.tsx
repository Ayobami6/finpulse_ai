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
    useDisclosure,
    Tooltip,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { Copy, Eye, EyeOff, ExternalLink } from "lucide-react";
import { integrationService, IntegrationConfig } from "@/services/integrationService";
import { teamService, TeamMember } from "@/services/teamService";

export default function SettingsPage() {
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamLoading, setTeamLoading] = useState(true);
    const [showSecret, setShowSecret] = useState(false);
    const { isOpen: isIntegrationOpen, onOpen: onIntegrationOpen, onClose: onIntegrationClose } = useDisclosure();
    const { isOpen: isTeamOpen, onOpen: onTeamOpen, onClose: onTeamClose } = useDisclosure();
    const toast = useToast();

    const getWebhookUrl = (source: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
        return `${baseUrl}/api/integrations/${source}/webhook/`;
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: `${label} copied to clipboard.`,
            status: "success",
            duration: 2000,
        });
    };

    // Form state
    const [formData, setFormData] = useState<IntegrationConfig>({
        source_type: 'freshchat',
        api_key: '',
        webhook_secret: '',
        account_url: '',
        is_active: true
    });

    const [teamFormData, setTeamFormData] = useState<TeamMember>({
        name: '',
        email: '',
        department: 'Engineering'
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

    const fetchTeamMembers = async () => {
        try {
            setTeamLoading(true);
            const data = await teamService.getTeamMembers();
            setTeamMembers(data);
        } catch (error) {
            console.error("Error fetching team members:", error);
            toast({
                title: "Error",
                description: "Failed to load team members.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
        fetchTeamMembers();
    }, []);

    const handleSaveIntegration = async () => {
        try {
            await integrationService.saveIntegration(formData);
            toast({
                title: "Success",
                description: "Integration saved successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onIntegrationClose();
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

    const handleSaveTeamMember = async () => {
        try {
            await teamService.saveTeamMember(teamFormData);
            toast({
                title: "Success",
                description: "Team member added successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onTeamClose();
            fetchTeamMembers();
            setTeamFormData({
                name: '',
                email: '',
                department: 'Engineering'
            });
        } catch (error) {
            console.error("Error adding team member:", error);
            toast({
                title: "Error",
                description: "Failed to add team member.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteIntegration = async (id: number) => {
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

    const handleDeleteTeamMember = async (id: number) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;
        try {
            await teamService.deleteTeamMember(id);
            toast({
                title: "Removed",
                description: "Team member removed.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchTeamMembers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove team member.",
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
                        Manage access for Product, Engineering, and Customer Support team members.
                    </Text>

                    {teamLoading ? (
                        <Flex justify="center" py={4}><Spinner /></Flex>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {teamMembers.length === 0 ? (
                                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>No team members added yet.</Text>
                            ) : (
                                teamMembers.map((member) => (
                                    <Flex key={member.id} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.100">
                                        <Box>
                                            <Text fontSize="sm" fontWeight="medium" color="gray.700">{member.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{member.email} • <Badge size="sm" variant="outline" colorScheme="blue">{member.department}</Badge></Text>
                                        </Box>
                                        <IconButton
                                            aria-label="Delete member"
                                            variant="ghost"
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => member.id && handleDeleteTeamMember(member.id)}
                                        >
                                            <Icon as={Trash2} boxSize={4} />
                                        </IconButton>
                                    </Flex>
                                ))
                            )}
                        </VStack>
                    )}

                    <Button mt={6} w="full" variant="outline" borderStyle="dashed" color="gray.600" onClick={onTeamOpen}>
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
                        <Button size="sm" colorScheme="purple" leftIcon={<Plus size={16} />} onClick={onIntegrationOpen}>
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
                                        <Box flex="1">
                                            <Flex justify="space-between" align="center" mb={1}>
                                                <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                                                    {integration.source_type === 'freshchat' ? 'Freshchat' : 'WhatsApp'}
                                                </Text>
                                                <Badge colorScheme={integration.is_active ? "green" : "gray"} variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="2xs">
                                                    {integration.is_active ? "Connected" : "Disconnected"}
                                                </Badge>
                                            </Flex>
                                            <Box mb={2}>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Webhook URL:</Text>
                                                <InputGroup size="xs">
                                                    <Input
                                                        readOnly
                                                        value={getWebhookUrl(integration.source_type)}
                                                        bg="white"
                                                        pr="4.5rem"
                                                    />
                                                    <InputRightElement width="4.5rem">
                                                        <Button h="1.2rem" size="xs" onClick={() => copyToClipboard(getWebhookUrl(integration.source_type), "Webhook URL")}>
                                                            Copy
                                                        </Button>
                                                    </InputRightElement>
                                                </InputGroup>
                                            </Box>
                                            <Text fontSize="2xs" color="gray.400">
                                                Last synced {integration.last_synced_at ? new Date(integration.last_synced_at).toLocaleString() : 'Never'}
                                            </Text>
                                        </Box>
                                        <HStack alignSelf="flex-start" ml={4}>
                                            <IconButton
                                                aria-label="Delete integration"
                                                variant="ghost"
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => integration.id && handleDeleteIntegration(integration.id)}
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
            <Modal isOpen={isIntegrationOpen} onClose={onIntegrationClose}>
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
                                <FormLabel fontSize="sm">API Secret / API Key</FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        type={showSecret ? "text" : "password"}
                                        placeholder="Enter API Key from provider"
                                        value={formData.api_key}
                                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    />
                                    <InputRightElement width="3rem">
                                        <IconButton
                                            h="1.75rem"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowSecret(!showSecret)}
                                            icon={showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                            aria-label={showSecret ? "Hide secret" : "Show secret"}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Webhook Secret (Verification Token)</FormLabel>
                                <Input
                                    placeholder="Set a secret token to verify webhooks"
                                    value={formData.webhook_secret}
                                    onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    This token will be used to verify that requests are coming from {formData.source_type === 'freshchat' ? 'Freshchat' : 'Meta (WhatsApp)'}.
                                </Text>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Account URL / Phone ID</FormLabel>
                                <Input
                                    placeholder={formData.source_type === 'freshchat' ? "https://your-domain.freshchat.com" : "e.g. 10455584444"}
                                    value={formData.account_url}
                                    onChange={(e) => setFormData({ ...formData, account_url: e.target.value })}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.source_type === 'freshchat' ? "Your Freshchat account URL." : "Your WhatsApp Phone Number ID."}
                                </Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onIntegrationClose}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleSaveIntegration}>Save Integration</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Team Member Modal */}
            <Modal isOpen={isTeamOpen} onClose={onTeamClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Team Member</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Full Name</FormLabel>
                                <Input
                                    placeholder="e.g. Ayobami"
                                    value={teamFormData.name}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Email Address</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="e.g. ayo@finpulse.ai"
                                    value={teamFormData.email}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Department</FormLabel>
                                <Select
                                    value={teamFormData.department}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, department: e.target.value })}
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Product">Product</option>
                                    <option value="Customer Support">Customer Support</option>
                                    <option value="Operations">Operations</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onTeamClose}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleSaveTeamMember}>Add Member</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

