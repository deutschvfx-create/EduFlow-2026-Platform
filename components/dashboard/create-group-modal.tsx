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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from 'react';
import { Teacher } from '@/lib/types/teacher';
import { Layers } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";
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

import { useModules } from '@/hooks/use-modules';
import { Faculty } from '@/lib/types/faculty';
import { Department } from '@/lib/types/department';

interface CreateGroupModalProps {
    onSuccess: () => void;
}

export function CreateGroupModal({ onSuccess }: CreateGroupModalProps) {
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [teacher, setTeacher] = useState('');
    const [facultyId, setFacultyId] = useState<string>('default');
    const [departmentId, setDepartmentId] = useState<string>('default');

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            import("@/lib/data/teachers.repo").then(({ teachersRepo }) => {
                teachersRepo.getAll(currentOrganizationId).then(setTeachers);
            });
            if (modules.faculties) {
                import("@/lib/data/faculties.repo").then(({ facultiesRepo }) => {
                    facultiesRepo.getAll(currentOrganizationId).then(setFaculties);
                });
            }
            if (modules.departments) {
                import("@/lib/data/departments.repo").then(({ departmentsRepo }) => {
                    departmentsRepo.getAll(currentOrganizationId).then(setDepartments);
                });
            }
        }
    }, [open, currentOrganizationId, modules.faculties, modules.departments]);

    const filteredDepartments = departmentId === 'default'
        ? departments.filter(d => facultyId === 'default' || d.facultyId === facultyId)
        : departments;

    const handleSubmit = async () => {
        if (!name || !currentOrganizationId) return;

        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            await groupsRepo.add(currentOrganizationId, {
                id: generateId(),
                organizationId: currentOrganizationId,
                name,
                curatorTeacherId: teacher || undefined,
                studentsCount: 0,
                status: 'ACTIVE',
                code: name.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
                facultyId: modules.faculties ? facultyId : 'default',
                departmentId: modules.departments ? departmentId : 'default',
                paymentType: 'FREE',
                level: 'A1',
                maxStudents: 30,
                teachersCount: teacher ? 1 : 0,
                coursesCount: 0,
                createdAt: new Date().toISOString()
            } as any);
            setOpen(false);
            setName('');
            setTeacher('');
            setFacultyId('default');
            setDepartmentId('default');
            onSuccess();
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("Ошибка при создании группы. Попробуйте еще раз.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-zinc-500 transition-colors">
                        <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 uppercase tracking-tighter">Группа</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать группу</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Создайте новую учебную группу и назначьте куратора.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Название *</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="например, ИВТ-2026" className="bg-zinc-950 border-zinc-800" />
                        </div>

                        {modules.faculties && (
                            <div className="grid gap-2">
                                <Label htmlFor="faculty">Факультет</Label>
                                <Select onValueChange={setFacultyId} value={facultyId}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                        <SelectValue placeholder="Выберите факультет..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        <SelectItem value="default">Не выбрано</SelectItem>
                                        {faculties.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {modules.departments && (
                            <div className="grid gap-2">
                                <Label htmlFor="department">Кафедра</Label>
                                <Select onValueChange={setDepartmentId} value={departmentId}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                        <SelectValue placeholder="Выберите кафедру..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                        <SelectItem value="default">Не выбрано</SelectItem>
                                        {filteredDepartments.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="teacher">Куратор</Label>
                            <Select onValueChange={setTeacher} value={teacher}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите куратора..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                                    {teachers.map(t => (
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
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!name} className="bg-indigo-600 hover:bg-indigo-700 text-white">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
