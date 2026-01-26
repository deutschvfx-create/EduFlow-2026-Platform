'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";

export function AddFacultyModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");

    const handleNameChange = (val: string) => {
        setName(val);
        // Auto-generate code if empty
        if (!code && val.length > 3) {
            setCode(val.substring(0, 4).toUpperCase());
        }
    }

    const handleSubmit = async () => {
        if (!name || !code) {
            alert("Название и код обязательны");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setOpen(false);
        alert(`Факультет ${name} успешно создан (Mock)`);

        // Reset form
        setName("");
        setCode("");
        setDescription("");
        setHeadTeacherId("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить факультет
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление факультета</DialogTitle>
                    <DialogDescription>Создайте новый факультет в структуре университета</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Название *</Label>
                        <Input
                            placeholder="Например: Факультет информационных технологий"
                            className="bg-zinc-950 border-zinc-800"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Код (ID) *</Label>
                        <Input
                            placeholder="IT"
                            className="bg-zinc-950 border-zinc-800 uppercase"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={10}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            placeholder="Краткое описание деятельности..."
                            className="bg-zinc-950 border-zinc-800 resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Руководитель (Декан)</Label>
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
