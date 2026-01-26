import { Badge } from "@/components/ui/badge";
import { StudentStatus } from "@/lib/types/student";

const statusConfig: Record<StudentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активен", variant: "outline" },
    PENDING: { label: "Ожидает", variant: "secondary" },
    SUSPENDED: { label: "Заблокирован", variant: "destructive" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
    const config = statusConfig[status];

    // Custom styling for "success" since standard badge might not have it
    const className = status === 'ACTIVE'
        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
        : "";

    return (
        <Badge variant={status === 'ACTIVE' ? 'outline' : config.variant} className={className}>
            {config.label}
        </Badge>
    );
}
