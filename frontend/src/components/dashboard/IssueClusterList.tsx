"use client";

import IssueCard, { IssueCluster } from "./IssueCard";

interface IssueClusterListProps {
    clusters: IssueCluster[];
}

export default function IssueClusterList({ clusters }: IssueClusterListProps) {
    if (!clusters || clusters.length === 0) {
        return <div className="text-gray-400 italic">No issues detected.</div>
    }

    return (
        <div className="flex flex-col gap-4">
            {clusters.map((cluster) => (
                <IssueCard key={cluster.id} cluster={cluster} />
            ))}
        </div>
    );
}
