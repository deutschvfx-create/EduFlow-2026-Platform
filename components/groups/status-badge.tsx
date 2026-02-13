import { Badge } from "@/components/ui/badge";
import { GroupStatus } from "@/lib/types/group";

const statusConfig: Record<GroupStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активна", variant: "outline" },
    INACTIVE: { label: "Неактивна", variant: "secondary" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
    const safeStatus = statusConfig[status] ? status : 'INACTIVE';
    const config = statusConfig[safeStatus];

    const className = status === 'ACTIVE'
        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
        : status === 'ARCHIVED'
            ? "text-muted-foreground border-border bg-secondary"
            : "";

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}

export function GroupLevelBadge({ level }: { level?: string }) {
    if (!level) return null;
    return (
        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
            {level}
        </Badge>
    );
}

export function GroupPaymentBadge({ type }: { type?: "FREE" | "PAID" }) {
    if (!type) return null;
    return (
        <Badge variant="outline" className={
            type === 'PAID'
                ? "border-amber-500/20 text-amber-400 bg-amber-500/10"
                : "border-border text-muted-foreground bg-secondary"
        }>
            {type === 'PAID' ? 'Платно' : 'Бесплатно'}
        </Badge>
    );
}
