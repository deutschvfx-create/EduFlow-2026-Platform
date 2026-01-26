'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_TEACHERS } from '@/lib/mock/teachers';
import { Layers } from "lucide-react";
// import { toast } from "sonner";
const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) }; // Using custom toast or this if available, reverting to alert if needed or custom hook from settings? 
// Actually user asked for "show toast 'Создано'". Since I set up custom toast in settings page locally, 
// I should probably export that toast context or just use sonner if it was actually available? 
// Wait, in previous turn I found sonner was MISSING. 
// So I should use a simple browser alert or the custom toast I implemented?
// The user "manual test" says "Create group -> toast appears".
// For speed, I'll use a local simple toast/alert or re-implement the custom toast as a shared component.
// Re-implementing shared toast is best. But for now I'll stick to a simple UI feedback or re-use the custom one if I move it.
// Let's assume I'll make a simple implementation inside QuickActions or just usage of 'alert' wrapped nicely if I don't want to overengineer.
// BUT, the user prompt says "show toast 'Создано'". 
// I'll create a simple hook-based toast or just use the one I made in settings if I move it to a context.
// Ideally, I should just use `window.alert` for now or a local state in QuickActions to show a message floating.
// Let's go with local state in QuickActions to show the toast, bubbling up success.

interface CreateGroupModalProps {
    onSuccess: () => void;
}

export function CreateGroupModal({ onSuccess }: CreateGroupModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [teacher, setTeacher] = useState('');

    const handleSubmit = () => {
        if (!name) return;

        import("@/lib/data/groups.repo").then(({ groupsRepo }) => {
            groupsRepo.add({
                id: crypto.randomUUID(),
                name,
                curatorTeacherId: teacher || undefined,
                studentsCount: 0,
                status: 'ACTIVE',
                code: 'NEW',
                facultyId: 'unknown',
                departmentId: 'unknown',
                paymentType: 'FREE',
                level: 'A1',
                facultyName: 'Факультет Неизвестен',
                facultyCode: 'UNK',
                departmentName: 'Кафедра Неизвестна',
                departmentCode: 'UNK',
                maxStudents: 30,
                teachersCount: 1,
                coursesCount: 0,
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
                <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 group">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        <Layers className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-xs">Добавить группу</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать группу</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Создайте новую учебную группу и назначьте куратора.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Название *</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="например, ИВТ-2026" className="bg-zinc-950 border-zinc-800" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher">Куратор</Label>
                        <Select onValueChange={setTeacher} value={teacher}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Выберите куратора..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                {MOCK_TEACHERS.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Заметки</Label>
                        <Textarea id="notes" placeholder="Дополнительная информация..." className="bg-zinc-950 border-zinc-800" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!name} className="bg-indigo-600 hover:bg-indigo-700 text-white">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
