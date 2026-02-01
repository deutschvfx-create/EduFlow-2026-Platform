'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

interface CreateTeacherModalProps {
    onSuccess: () => void;
}

export function CreateTeacherModal({ onSuccess }: CreateTeacherModalProps) {
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { currentOrganizationId } = useOrganization();

    const handleSubmit = () => {
        if (!firstName) return;

        import("@/lib/data/teachers.repo").then(({ teachersRepo }) => {
            teachersRepo.add({
                id: generateId(),
                organizationId: currentOrganizationId!,
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}@eduflow.com`,
                role: 'TEACHER',
                status: 'ACTIVE',
                groupIds: [],
                createdAt: new Date().toISOString(),
                permissions: {
                    canCreateGroups: false,
                    canManageStudents: true,
                    canMarkAttendance: true,
                    canGradeStudents: true,
                    canSendAnnouncements: false,
                    canUseChat: true,
                    canInviteStudents: false
                }
            });
            setOpen(false);
            setFirstName('');
            setLastName('');
            onSuccess();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-zinc-500 transition-colors">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 uppercase tracking-tighter">Учитель</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Пригласить преподавателя</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Создайте профиль преподавателя.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fname">Имя *</Label>
                            <Input id="fname" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lname">Фамилия</Label>
                            <Input id="lname" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!firstName} className="bg-purple-600 hover:bg-purple-700 text-white">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
