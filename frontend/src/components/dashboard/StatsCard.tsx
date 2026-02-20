import { ReactNode } from "react";
import { Card, CardBody, Box, Text, HStack, Icon, Flex } from "@chakra-ui/react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export default function StatsCard({ title, value, icon, trend, trendDirection }: StatsCardProps) {
  const trendColor =
    trendDirection === "up" ? "green.500" :
      trendDirection === "down" ? "red.500" :
        "gray.500";

  const TrendIcon = trendDirection === "up" ? ArrowUp : trendDirection === "down" ? ArrowDown : Minus;

  return (
    <Card h="full" variant="outline" bg="white">
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1} fontWeight="medium">
              {title}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" lineHeight="1.2">
              {value}
            </Text>
          </Box>
          <Flex
            p={2}
            borderRadius="full"
            bg="gray.50"
            align="center"
            justify="center"
            color="gray.500"
          >
            {/* The icon passed is likely an MUI icon element unless refactored. 
               We should ideally wrap it or expect a Lucide icon component. 
               For now we render what is passed, but styles might need check. */}
            {icon}
          </Flex>
        </Flex>
        {trend && (
          <HStack mt={4} spacing={1}>
            <Icon as={TrendIcon} color={trendColor} boxSize={4} />
            <Text fontSize="sm" color={trendColor} fontWeight="medium">
              {trend}
            </Text>
          </HStack>
        )}
      </CardBody>
    </Card>
  );
}
