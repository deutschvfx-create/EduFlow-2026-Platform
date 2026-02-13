'use client';

import { PersonRegistrationModal } from "@/components/shared/person-registration-modal";
import { Group } from "@/lib/types/group";

interface AddStudentModalProps {
    group?: Group;
    customTrigger?: React.ReactNode;
}

export function AddStudentModal({ group, customTrigger }: AddStudentModalProps) {
    return (
        <PersonRegistrationModal
            role="student"
            group={group}
            customTrigger={customTrigger}
        />
    );
}
