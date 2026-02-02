import { Badge } from "@/components/ui/badge";
import { TeacherStatus, TeacherRole } from "@/lib/types/teacher";

const statusConfig: Record<TeacherStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Активен", variant: "outline" }, // Will style specifically
    INVITED: { label: "Приглашен", variant: "secondary" },
    SUSPENDED: { label: "Заблокирован", variant: "destructive" },
    ARCHIVED: { label: "Архив", variant: "outline" }
};

const roleConfig: Record<TeacherRole, { label: string; className: string }> = {
    admin: { label: "Админ", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    curator: { label: "Куратор", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    teacher: { label: "Учитель", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    ADMIN: { label: "Админ", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    CURATOR: { label: "Куратор", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    TEACHER: { label: "Учитель", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
};

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
    const config = statusConfig[status];

    // Custom styling for "active" 
    const className = status === 'ACTIVE'
        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
        : "";

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}

export function TeacherRoleBadge({ role }: { role: TeacherRole }) {
    const config = roleConfig[role];
    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}
