'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { Teacher } from "@/lib/types/teacher";
import { generateId } from "@/lib/utils";

export function AddFacultyModal() {
    const { currentOrganizationId } = useOrganization();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dynamic data
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");

    useEffect(() => {
        if (open && currentOrganizationId) {
            import("@/lib/data/teachers.repo").then(async ({ teachersRepo }) => {
                const data = await teachersRepo.getAll(currentOrganizationId);
                setTeachers(data);
            });
        }
    }, [open, currentOrganizationId]);

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

        if (!currentOrganizationId) return;

        setLoading(true);
        try {
            const { facultiesRepo } = await import("@/lib/data/faculties.repo");
            await facultiesRepo.add({
                id: generateId(),
                organizationId: currentOrganizationId,
                name,
                code,
                description,
                headTeacherId: headTeacherId || undefined,
                createdAt: new Date().toISOString(),
                departmentsCount: 0,
                groupsCount: 0,
                studentsCount: 0,
                teachersCount: 0,
                status: 'ACTIVE'
            });

            setOpen(false);
            // Reset form
            setName("");
            setCode("");
            setDescription("");
            setHeadTeacherId("");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании факультета");
        } finally {
            setLoading(false);
        }
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
                                {teachers.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName} ({t.specialization || "Преподаватель"})
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
