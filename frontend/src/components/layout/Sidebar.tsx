"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  AlertTriangle,
  Users,
  FileText,
  Menu,
  X,
  LucideIcon
} from "lucide-react";
import {
  Box,
  Flex,
  Icon,
  Text,
  IconButton,
  VStack,
  useBreakpointValue,
  Link as ChakraLink
} from "@chakra-ui/react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Issues", href: "/issues", icon: AlertTriangle },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <IconButton
        aria-label="Toggle Menu"
        icon={isOpen ? <X size={24} /> : <Menu size={24} />}
        onClick={toggleSidebar}
        display={{ base: "flex", lg: "none" }}
        position="fixed"
        top="4"
        left="4"
        zIndex="60"
        bg="white"
        color="gray.600"
        shadow="sm"
        _hover={{ bg: "gray.50" }}
      />

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <Box
          position="fixed"
          inset="0"
          bg="blackAlpha.500"
          zIndex="40"
          backdropFilter="blur(2px)"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Box
        as="aside"
        w="260px"
        h="100vh"
        bgGradient="linear(to-b, brand.400, brand.700)"
        color="white"
        py={6}
        px={6}
        display="flex"
        flexDirection="column"
        position={{ base: "fixed", lg: "sticky" }}
        top="0"
        left="0"
        zIndex="50"
        transform={{
          base: isOpen ? "translateX(0)" : "translateX(-100%)",
          lg: "translateX(0)",
        }}
        transition="transform 0.3s ease-in-out"
        boxShadow={{ base: isOpen ? "xl" : "none", lg: "none" }}
      >
        {/* Logo */}
        <Box mb={10}>
          <Flex align="center" gap={2} mb={1}>
            <Icon as={LayoutDashboard} boxSize={7} />
            <Text fontSize="xl" fontWeight="bold">FinPulse AI</Text>
          </Flex>
          <Text fontSize="xs" opacity={0.7} fontWeight="normal">Intelligent Operations</Text>
        </Box>

        {/* Nav */}
        <VStack spacing={2} align="stretch" flex={1}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ChakraLink
                as={Link}
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                _hover={{ textDecoration: "none" }}
              >
                <Flex
                  align="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  transition="all 0.2s"
                  bg={isActive ? "whiteAlpha.200" : "transparent"}
                  color={isActive ? "white" : "whiteAlpha.700"}
                  fontWeight={isActive ? "semibold" : "medium"}
                  _hover={{
                    bg: "whiteAlpha.100",
                    color: "white",
                  }}
                  boxShadow={isActive ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none"}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontSize="sm">{item.name}</Text>
                </Flex>
              </ChakraLink>
            );
          })}
        </VStack>

        {/* User Profile */}
        <Flex
          mt={4}
          pt={4}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          align="center"
          gap={3}
        >
          <Flex
            w={8}
            h={8}
            borderRadius="full"
            bg="brand.300"
            align="center"
            justify="center"
            fontWeight="bold"
            color="white"
          >
            A
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="semibold">Admin User</Text>
            <Text fontSize="xs" color="brand.200">admin@finpulse.ai</Text>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
