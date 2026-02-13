import { Student } from "@/lib/types/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StudentCompactCardProps {
    student: Student;
    isSelected: boolean;
    isMultiSelecting?: boolean;
    isChecked?: boolean;
    onToggleCheck?: (id: string) => void;
    onClick: () => void;
}

export function StudentCompactCard({
    student,
    isSelected,
    isMultiSelecting,
    isChecked,
    onToggleCheck,
    onClick
}: StudentCompactCardProps) {
    return (
        <div
            onClick={() => {
                if (isMultiSelecting && onToggleCheck) {
                    onToggleCheck(student.id);
                } else {
                    onClick();
                }
            }}
            className={cn(
                "group relative p-3 rounded-[12px] cursor-pointer transition-all duration-200 border border-transparent select-none mx-2",
                isSelected && !isMultiSelecting
                    ? "bg-[#2563EB]/5 border-[#2563EB]/20 shadow-sm"
                    : "hover:bg-[#F5F6F8] active:scale-[0.98]"
            )}
        >
            <div className="flex items-center gap-3">
                {/* Avatar / Selection */}
                <div className="relative shrink-0">
                    <Avatar className={cn(
                        "h-11 w-11 rounded-[10px] border transition-all duration-300",
                        isSelected && !isMultiSelecting ? "border-[#2563EB] shadow-md" : "border-[#E5E7EB]"
                    )}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} className="object-cover" />
                        <AvatarFallback className="bg-[#2563EB]/5 text-[#2563EB] font-black text-[12px]">
                            {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                    </Avatar>

                    {isMultiSelecting && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCheck?.(student.id);
                            }}
                            className={cn(
                                "absolute -top-1 -left-1 h-5 w-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-all",
                                isChecked ? "bg-[#2563EB] scale-110" : "bg-[#F5F6F8] hover:bg-[#E5E7EB]"
                            )}
                        >
                            {isChecked && <Check className="h-3 w-3 text-white" />}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className={cn(
                            "text-[14px] font-black tracking-tight truncate font-inter",
                            isSelected && !isMultiSelecting ? "text-[#2563EB]" : "text-[#0F172A]"
                        )}>
                            {student.firstName} {student.lastName}
                        </h3>
                        <span className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            student.academicStatus === 'ACTIVE' || student.status === 'ACTIVE' ? "bg-[#22C55E]" : "bg-[#64748B]"
                        )} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-inter">
                            {student.groupIds?.[0] || 'Без Группы'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                        <span className="text-[11px] font-medium text-[#64748B] font-mono opacity-60">
                            #{student.id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Left Indicator for selected */}
                {isSelected && !isMultiSelecting && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563EB] rounded-r-full" />
                )}
            </div>
        </div>
    );
}
