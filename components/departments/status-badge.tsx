import { Badge } from "@/components/ui/badge";
import { DepartmentStatus } from "@/lib/types/department";

const statusConfig: Record<DepartmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активна", variant: "outline" },
    INACTIVE: { label: "Неактивна", variant: "secondary" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

export function DepartmentStatusBadge({ status }: { status: DepartmentStatus }) {
    const config = statusConfig[status];

    const className = status === 'ACTIVE'
        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
        : status === 'ARCHIVED'
            ? "text-zinc-500 border-zinc-700 bg-zinc-800"
            : "";

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}
