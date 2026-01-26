'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Using the component we created earlier
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { MOCK_FACULTIES } from "@/lib/mock/faculties";

export function AddDepartmentModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");

    const handleNameChange = (val: string) => {
        setName(val);
        // Auto-generate code if empty
        if (!code && val.length > 3) {
            // Simplified transliteration or just upper case first letters could be better, but simple is fine for mock
            const generated = val.split(' ').map(w => w[0]).join('').toUpperCase() + "-" + Math.floor(Math.random() * 100);
            setCode(generated);
        }
    }

    const handleSubmit = async () => {
        if (!name || !code || !facultyId) {
            alert("Название, код и факультет обязательны");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setOpen(false);
        alert(`Кафедра ${name} успешно создана (Mock)`);

        // Reset form
        setName("");
        setCode("");
        setDescription("");
        setHeadTeacherId("");
        setFacultyId("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить кафедру
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление кафедры</DialogTitle>
                    <DialogDescription>Создайте новую кафедру в составе факультета</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Факультет *</Label>
                        <Select value={facultyId} onValueChange={setFacultyId}>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Название *</Label>
                            <Input
                                placeholder="Например: Кафедра математики"
                                className="bg-zinc-950 border-zinc-800"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Код (ID) *</Label>
                            <Input
                                placeholder="MATH-DEPT"
                                className="bg-zinc-950 border-zinc-800 uppercase"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={12}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            placeholder="Описание деятельности кафедры..."
                            className="bg-zinc-950 border-zinc-800 resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Руководитель (Заведующий)</Label>
                        <Select value={headTeacherId} onValueChange={setHeadTeacherId}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Выберите преподавателя" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_TEACHERS.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName} ({t.specialization})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
