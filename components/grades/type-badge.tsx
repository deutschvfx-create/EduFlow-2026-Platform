import { Badge } from "@/components/ui/badge";
import { GradeType } from "@/lib/types/grades";
import { BookOpen, ClipboardList, GraduationCap, Users, FileText } from "lucide-react";

const config: Record<GradeType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
    HOMEWORK: { label: "Домашнее задание", variant: "secondary", icon: BookOpen, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    QUIZ: { label: "Тест", variant: "outline", icon: ClipboardList, color: "text-amber-500 border-amber-500/20 bg-amber-500/10" },
    EXAM: { label: "Экзамен", variant: "destructive", icon: GraduationCap, color: "text-red-500 border-red-500/20 bg-red-500/10" },
    PROJECT: { label: "Проект", variant: "secondary", icon: FileText, color: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
    PARTICIPATION: { label: "Активность", variant: "outline", icon: Users, color: "text-green-500 border-green-500/20 bg-green-500/10" },
};

export function GradeTypeBadge({ type }: { type: GradeType }) {
    const s = config[type];
    const Icon = s.icon;

    return (
        <Badge variant="outline" className={`gap-1 ${s.color}`}>
            <Icon className="h-3 w-3" />
            {s.label}
        </Badge>
    );
}
