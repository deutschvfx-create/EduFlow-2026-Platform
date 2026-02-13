import { Teacher } from "@/lib/types/teacher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";
import { TeacherPassportModal } from "./teacher-passport";

interface TeacherCompactCardProps {
    teacher: Teacher;
    isSelected: boolean;
    isMultiSelecting?: boolean;
    isChecked?: boolean;
    onToggleCheck?: (id: string) => void;
    onClick: () => void;
}

export function TeacherCompactCard({
    teacher,
    isSelected,
    isMultiSelecting,
    isChecked,
    onToggleCheck,
    onClick
}: TeacherCompactCardProps) {
    const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

    return (
        <div
            onClick={() => {
                if (isMultiSelecting && onToggleCheck) {
                    onToggleCheck(teacher.id);
                } else {
                    onClick();
                }
            }}
            className={cn(
                "group relative p-3 rounded-[12px] cursor-pointer transition-all duration-200 border border-transparent select-none mx-2",
                teacher.status === 'SUSPENDED' && !isSelected && "animate-pulse-yellow",
                isSelected && !isMultiSelecting
                    ? "bg-[#0F4C3D]/5 border-[#0F4C3D]/20 shadow-sm"
                    : "hover:bg-[#F5F6F8] active:scale-[0.98]"
            )}
        >
            <div className="flex items-center gap-3">
                {/* Avatar / Selection */}
                <div className="relative shrink-0">
                    <Avatar
                        className={cn(
                            "h-11 w-11 rounded-[10px] border transition-all duration-300 shrink-0 cursor-zoom-in hover:opacity-80",
                            isSelected && !isMultiSelecting ? "border-[#0F4C3D] shadow-md" : "border-[#E5E7EB]"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPassportModalOpen(true);
                        }}
                    >
                        <AvatarImage src={teacher.passportPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.firstName}${teacher.lastName}`} className="object-cover object-top" />
                        <AvatarFallback className="bg-[#0F4C3D]/5 text-[#0F4C3D] font-black text-[12px]">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                        </AvatarFallback>
                    </Avatar>

                    {isMultiSelecting && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCheck?.(teacher.id);
                            }}
                            className={cn(
                                "absolute -top-1 -left-1 h-5 w-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-all",
                                isChecked ? "bg-[#0F4C3D] scale-110" : "bg-[#F5F6F8] hover:bg-[#E5E7EB]"
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
                            isSelected && !isMultiSelecting ? "text-[#0F4C3D]" : "text-[#0F172A]"
                        )}>
                            {teacher.firstName} {teacher.lastName}
                        </h3>
                        <span className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            teacher.status === 'ACTIVE' ? "bg-[#22C55E]" : "bg-[#64748B]"
                        )} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-inter truncate max-w-[120px]">
                            {teacher.specialization || 'Нет спец.'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                        <span className="text-[11px] font-medium text-[#64748B] font-mono opacity-60">
                            #{teacher.id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Left Indicator for selected */}
                {isSelected && !isMultiSelecting && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0F4C3D] rounded-r-full" />
                )}
            </div>

            <TeacherPassportModal
                teacher={teacher}
                open={isPassportModalOpen}
                onOpenChange={setIsPassportModalOpen}
            />
        </div>
    );
}
