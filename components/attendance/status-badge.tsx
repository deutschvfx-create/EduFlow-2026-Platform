import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/lib/types/attendance";
import { Check, X, Clock, FileText, HelpCircle } from "lucide-react";

const config: Record<AttendanceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
    PRESENT: { label: "Присутствовал", variant: "outline", icon: Check, color: "text-green-500 border-green-500/20 bg-green-500/10" },
    ABSENT: { label: "Отсутствовал", variant: "destructive", icon: X, color: "text-red-500 border-red-500/20 bg-red-500/10" },
    LATE: { label: "Опоздал", variant: "secondary", icon: Clock, color: "text-amber-500 border-amber-500/20 bg-amber-500/10" },
    EXCUSED: { label: "Уважительная", variant: "secondary", icon: FileText, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    UNKNOWN: { label: "Не отмечен", variant: "outline", icon: HelpCircle, color: "text-zinc-500 border-zinc-700 bg-zinc-800" }
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
    const s = config[status] || config.UNKNOWN;
    const Icon = s.icon;

    return (
        <Badge variant="outline" className={`gap-1 ${s.color}`}>
            <Icon className="h-3 w-3" />
            {s.label}
        </Badge>
    );
}
