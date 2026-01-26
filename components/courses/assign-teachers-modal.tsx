'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { Course } from "@/lib/types/course";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignTeachersModalProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, teacherIds: string[]) => void;
}

export function AssignTeachersModal({ course, open, onOpenChange, onSave }: AssignTeachersModalProps) {
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (course) {
            setSelectedIds([...course.teacherIds]);
        } else {
            setSelectedIds([]);
        }
        setSearch("");
    }, [course]);

    const filteredTeachers = MOCK_TEACHERS.filter(t =>
    (t.firstName.toLowerCase().includes(search.toLowerCase()) ||
        t.lastName.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSubmit = async () => {
        if (!course) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        onSave(course.id, selectedIds);
        setLoading(false);
        onOpenChange(false);
    };

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Назначение преподавателей</DialogTitle>
                    <DialogDescription>Выберите преподавателей для предмета {course.name}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Поиск..."
                            className="pl-9 bg-zinc-950 border-zinc-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] border border-zinc-800 rounded-md p-2 bg-zinc-950/30">
                        <div className="space-y-1">
                            {filteredTeachers.map(teacher => {
                                const isSelected = selectedIds.includes(teacher.id);
                                return (
                                    <div
                                        key={teacher.id}
                                        onClick={() => toggleSelection(teacher.id)}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-900/30 hover:bg-indigo-900/50' : 'hover:bg-zinc-800'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-200">{teacher.firstName} {teacher.lastName}</span>
                                            <span className="text-xs text-zinc-500">{teacher.specialization}</span>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                                    </div>
                                )
                            })}
                            {filteredTeachers.length === 0 && (
                                <p className="text-center text-zinc-500 py-4">Преподаватели не найдены</p>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="text-xs text-zinc-500">
                        Выбрано: {selectedIds.length}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
