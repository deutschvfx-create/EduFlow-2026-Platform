'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

interface CreateCourseModalProps {
    onSuccess: () => void;
}

export function CreateCourseModal({ onSuccess }: CreateCourseModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const { currentOrganizationId } = useOrganization();

    const handleSubmit = () => {
        if (!name || !currentOrganizationId) return;

        import("@/lib/data/courses.repo").then(({ coursesRepo }) => {
            coursesRepo.add({
                id: generateId(),
                organizationId: currentOrganizationId,
                name,
                code: 'NEW',
                facultyId: 'unknown',
                facultyName: 'Факультет Неизвестен',
                facultyCode: 'UNK',
                departmentId: 'unknown',
                departmentName: 'Кафедра Неизвестна',
                departmentCode: 'UNK',
                status: 'ACTIVE',
                level: 'A1',
                teacherIds: [],
                teacherNames: [],
                groupIds: [],
                groupNames: [],
                createdAt: new Date().toISOString()
            });
            setOpen(false);
            setName('');
            onSuccess();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-zinc-500 transition-colors">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 uppercase tracking-tighter">Курс</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать предмет</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Название *</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!name} className="bg-cyan-600 hover:bg-cyan-700 text-white">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
