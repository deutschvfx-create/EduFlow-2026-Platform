'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Using the component we created earlier
import { useEffect } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { Teacher } from "@/lib/types/teacher";
import { Faculty } from "@/lib/types/faculty";
import { generateId } from "@/lib/utils";

import { useModules } from "@/hooks/use-modules";

export function AddDepartmentModal() {
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("default");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            const loadData = async () => {
                const { teachersRepo } = await import("@/lib/data/teachers.repo");
                const t = await teachersRepo.getAll(currentOrganizationId);
                setTeachers(t);

                if (modules.faculties) {
                    const { facultiesRepo } = await import("@/lib/data/faculties.repo");
                    const f = await facultiesRepo.getAll(currentOrganizationId);
                    setFaculties(f);
                }
            };
            loadData();
        }
    }, [open, currentOrganizationId, modules.faculties]);

    const handleNameChange = (val: string) => {
        setName(val);
        if (!code && val.length > 3) {
            const generated = val.split(' ').map(w => w[0]).join('').toUpperCase() + "-" + Math.floor(Math.random() * 100);
            setCode(generated);
        }
    }

    const handleSubmit = async () => {
        if (!name || !code || (modules.faculties && facultyId === 'default')) {
            alert("Заполните обязательные поля (Название, Код, Факультет)");
            return;
        }

        setLoading(true);
        try {
            const { departmentsRepo } = await import("@/lib/data/departments.repo");
            await departmentsRepo.add(currentOrganizationId!, {
                id: generateId(),
                organizationId: currentOrganizationId!,
                name,
                code,
                facultyIdByModule: modules.faculties ? facultyId : 'default',
                facultyId: modules.faculties ? facultyId : 'default',
                description,
                headTeacherId: headTeacherId || undefined,
                status: 'ACTIVE',
                teachersCount: 0,
                groupsCount: 0,
                studentsCount: 0,
                coursesCount: 0,
                createdAt: new Date().toISOString()
            } as any);
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании кафедры");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-foreground gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить кафедру
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Добавление кафедры</DialogTitle>
                    <DialogDescription>Создайте новую кафедру в составе факультета</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {modules.faculties && (
                        <div className="space-y-2">
                            <Label>Факультет *</Label>
                            <Select value={facultyId} onValueChange={setFacultyId}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Выберите факультет" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Не выбрано</SelectItem>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Название *</Label>
                            <Input
                                placeholder="Например: Кафедра математики"
                                className="bg-background border-border"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Код (ID) *</Label>
                            <Input
                                placeholder="MATH-DEPT"
                                className="bg-background border-border uppercase"
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
                            className="bg-background border-border resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Руководитель (Заведующий)</Label>
                        <Select value={headTeacherId} onValueChange={setHeadTeacherId}>
                            <SelectTrigger className="bg-background border-border">
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
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Создать
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
