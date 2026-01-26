import { Badge } from "@/components/ui/badge";
import { FacultyStatus } from "@/lib/types/faculty";

const statusConfig: Record<FacultyStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активен", variant: "outline" },
    INACTIVE: { label: "Неактивен", variant: "secondary" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

export function FacultyStatusBadge({ status }: { status: FacultyStatus }) {
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
