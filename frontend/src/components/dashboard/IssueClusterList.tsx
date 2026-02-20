import { Stack, Text } from "@chakra-ui/react";
import IssueCard, { IssueCluster } from "./IssueCard";

interface IssueClusterListProps {
    clusters: IssueCluster[];
}

export default function IssueClusterList({ clusters }: IssueClusterListProps) {
    if (!clusters || clusters.length === 0) {
        return <Text color="gray.500" fontStyle="italic">No issues detected.</Text>
    }

    return (
        <Stack spacing={2}>
            {clusters.map((cluster) => (
                <IssueCard key={cluster.id} cluster={cluster} />
            ))}
        </Stack>
    );
}
