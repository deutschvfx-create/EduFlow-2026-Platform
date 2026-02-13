'use client';

import { PersonRegistrationModal } from "@/components/shared/person-registration-modal";
import { Users } from "lucide-react";

interface CreateStudentModalProps {
    onSuccess: () => void;
}

export function CreateStudentModal({ onSuccess }: CreateStudentModalProps) {
    return (
        <PersonRegistrationModal
            role="student"
            onSuccess={onSuccess}
            customTrigger={
                <div className="group flex flex-col items-center justify-center gap-2.5 w-[140px] h-[96px] rounded-[14px] bg-white border border-[#DDE7EA] hover:border-[#2EC4C6] hover:bg-[#2EC4C6]/8 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="h-9 w-9 rounded-xl bg-[#F2F7F6] flex items-center justify-center group-hover:bg-[#2EC4C6]/15 text-[#0F3D4C] transition-colors">
                        <Users className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0F3D4C] transition-colors">Студент</span>
                </div>
            }
        />
    );
}
