'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Teacher, TeacherPermissions } from "@/lib/types/teacher";
import { useState, useEffect } from "react";

interface EditPermissionsModalProps {
    teacher: Teacher | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (teacherId: string, newPermissions: TeacherPermissions) => void;
}

const PERMISSION_LABELS: Record<keyof TeacherPermissions, string> = {
    canCreateGroups: "Создание групп",
    canManageStudents: "Управление студентами",
    canMarkAttendance: "Отметка посещаемости",
    canGradeStudents: "Выставление оценок",
    canSendAnnouncements: "Отправка объявлений",
    canUseChat: "Доступ к чатам",
    canInviteStudents: "Приглашение студентов"
};

export function EditPermissionsModal({ teacher, open, onOpenChange, onSave }: EditPermissionsModalProps) {
    const [permissions, setPermissions] = useState<TeacherPermissions | null>(null);

    useEffect(() => {
        if (teacher) {
            setPermissions({ ...teacher.permissions });
        }
    }, [teacher]);

    const handleToggle = (key: keyof TeacherPermissions) => {
        if (permissions) {
            setPermissions({ ...permissions, [key]: !permissions[key] });
        }
    }

    const handleSave = () => {
        if (teacher && permissions) {
            onSave(teacher.id, permissions);
            onOpenChange(false);
        }
    }

    if (!teacher || !permissions) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Права доступа</DialogTitle>
                    <DialogDescription>
                        Настройка прав для {teacher.firstName} {teacher.lastName}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {Object.keys(PERMISSION_LABELS).map((key) => {
                        const k = key as keyof TeacherPermissions;
                        return (
                            <div key={k} className="flex items-center justify-between space-x-2 border p-3 rounded-md border-zinc-800">
                                <Label htmlFor={k} className="flex-1 cursor-pointer">
                                    {PERMISSION_LABELS[k]}
                                </Label>
                                <Switch
                                    id={k}
                                    checked={permissions[k]}
                                    onCheckedChange={() => handleToggle(k)}
                                />
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300">Отмена</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
