'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_FACULTIES } from "@/lib/mock/faculties";
import { MOCK_DEPARTMENTS } from "@/lib/mock/departments";
import { generateId } from "@/lib/utils";

export function AddCourseModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [level, setLevel] = useState("");
    const [description, setDescription] = useState("");

    // Derived state
    const departments = MOCK_DEPARTMENTS.filter(d => d.facultyId === facultyId);

    const handleFacultyChange = (val: string) => {
        setFacultyId(val);
        setDepartmentId(""); // Reset department when faculty changes
    }

    const handleNameChange = (val: string) => {
        setName(val);
        // Basic auto-code attempt
        if (!code && val.length > 3) {
            const generated = val.split(' ').map(w => w[0]).join('').toUpperCase() + "-" + Math.floor(Math.random() * 100);
            setCode(generated);
        }
    }

    const handleSubmit = async () => {
        if (!name || !code || !facultyId || !departmentId) {
            alert("Заполните обязательные поля: Название, Код, Факультет, Кафедра");
            return;
        }

        setLoading(true);

        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            coursesRepo.add({
                id: generateId(),
                name,
                code,
                facultyId,
                facultyName: MOCK_FACULTIES.find(f => f.id === facultyId)?.name || 'Неизвестен',
                facultyCode: MOCK_FACULTIES.find(f => f.id === facultyId)?.code || 'UNK',
                departmentId,
                departmentName: MOCK_DEPARTMENTS.find(d => d.id === departmentId)?.name || 'Неизвестна',
                departmentCode: MOCK_DEPARTMENTS.find(d => d.id === departmentId)?.code || 'UNK',
                level,
                description,
                status: 'ACTIVE',
                teacherIds: [],
                teacherNames: [],
                groupIds: [],
                groupNames: [],
                createdAt: new Date().toISOString()
            });

            setOpen(false);

            // Reset form
            setName("");
            setCode("");
            setFacultyId("");
            setDepartmentId("");
            setLevel("");
            setDescription("");

            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Ошибка при создании предмета");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить предмет
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление предмета</DialogTitle>
                    <DialogDescription>Создайте новую учебную дисциплину</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Факультет *</Label>
                            <Select value={facultyId} onValueChange={handleFacultyChange}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите факультет" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_FACULTIES.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Кафедра *</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder={!facultyId ? "Сначала выберите факультет" : "Выберите кафедру"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Название *</Label>
                            <Input
                                placeholder="Например: General English"
                                className="bg-zinc-950 border-zinc-800"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Код (ID) *</Label>
                            <Input
                                placeholder="ENG-GEN"
                                className="bg-zinc-950 border-zinc-800 uppercase"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Уровень</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Выберите уровень (опционально)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A1">A1</SelectItem>
                                <SelectItem value="A2">A2</SelectItem>
                                <SelectItem value="B1">B1</SelectItem>
                                <SelectItem value="B2">B2</SelectItem>
                                <SelectItem value="C1">C1</SelectItem>
                                <SelectItem value="1 курс">1 курс</SelectItem>
                                <SelectItem value="2 курс">2 курс</SelectItem>
                                <SelectItem value="3 курс">3 курс</SelectItem>
                                <SelectItem value="4 курс">4 курс</SelectItem>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            placeholder="Краткое описание предмета..."
                            className="bg-zinc-950 border-zinc-800 resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Создать
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
