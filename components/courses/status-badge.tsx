import { Badge } from "@/components/ui/badge";
import { CourseStatus } from "@/lib/types/course";

const statusConfig: Record<CourseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активен", variant: "outline" },
    INACTIVE: { label: "Неактивен", variant: "secondary" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
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

export function CourseLevelBadge({ level }: { level?: string }) {
    if (!level) return null;
    return (
        <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/10">
            {level}
        </Badge>
    );
}
