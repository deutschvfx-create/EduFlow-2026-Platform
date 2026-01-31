'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building, Monitor, Microscope, Box } from "lucide-react";
import { Classroom, ClassroomType } from "@/lib/types/classroom";

interface CreateClassroomModalProps {
    children?: React.ReactNode;
    onSave: (classroom: Classroom) => void;
}

export function CreateClassroomModal({ children, onSave }: CreateClassroomModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState<ClassroomType>("CLASSROOM");
    const [capacity, setCapacity] = useState("");
    const [note, setNote] = useState("");

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);

        // Simulating API
        await new Promise(r => setTimeout(r, 600));

        const newClassroom: Classroom = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            status: 'ACTIVE',
            capacity: capacity ? parseInt(capacity) : undefined,
            note: note || undefined,
            color: '#6366f1' // Default Indigo
        };

        onSave(newClassroom);
        setLoading(false);
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setName("");
        setType("CLASSROOM");
        setCapacity("");
        setNote("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить аудиторию
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Новая аудитория</DialogTitle>
                    <DialogDescription>
                        Добавьте информацию о помещении или ресурсе.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Название / Номер *</Label>
                        <Input
                            placeholder="Например: 101, Лаборатория А, Zoom #1"
                            className="bg-zinc-950 border-zinc-800"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Тип</Label>
                            <Select value={type} onValueChange={(v) => setType(v as ClassroomType)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLASSROOM">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3 opacity-70" /> Кабинет
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="LAB">
                                        <div className="flex items-center gap-2">
                                            <Microscope className="h-3 w-3 opacity-70" /> Лаборатория
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ONLINE">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-3 w-3 opacity-70" /> Онлайн
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="OTHER">
                                        <div className="flex items-center gap-2">
                                            <Box className="h-3 w-3 opacity-70" /> Другое
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Вместимость</Label>
                            <Input
                                type="number"
                                placeholder="Необязательно"
                                className="bg-zinc-950 border-zinc-800"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Примечание</Label>
                        <Input
                            placeholder="Проектор, доска, макбуки..."
                            className="bg-zinc-950 border-zinc-800"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name || loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Создать
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
