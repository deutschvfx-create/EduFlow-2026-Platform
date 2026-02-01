'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/use-organization";
import { Teacher } from "@/lib/types/teacher";
import { Faculty } from "@/lib/types/faculty";
import { Department, DepartmentStatus } from "@/lib/types/department";

interface EditDepartmentModalProps {
    department: Department | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Department>) => void;
}

export function EditDepartmentModal({ department, open, onOpenChange, onSave }: EditDepartmentModalProps) {
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");
    const [status, setStatus] = useState<DepartmentStatus>("ACTIVE");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            Promise.all([
                import("@/lib/data/teachers.repo").then(m => m.teachersRepo.getAll(currentOrganizationId)),
                import("@/lib/data/faculties.repo").then(m => m.facultiesRepo.getAll(currentOrganizationId))
            ]).then(([t, f]) => {
                setTeachers(t);
                setFaculties(f);
            });
        }
    }, [open, currentOrganizationId]);

    useEffect(() => {
        if (department) {
            setName(department.name);
            setCode(department.code);
            setFacultyId(department.facultyId);
            setDescription(department.description || "");
            setHeadTeacherId(department.headTeacherId || "");
            setStatus(department.status);
        }
    }, [department]);

    const handleSubmit = async () => {
        if (!department) return;
        if (!name || !code || !facultyId) {
            alert("Название, код и факультет обязательны");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 600));

        onSave(department.id, {
            name,
            code,
            facultyId,
            description,
            headTeacherId,
            status,
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!department) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Редактирование кафедры</DialogTitle>
                    <DialogDescription>Изменение данных кафедры {department.code}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Факультет *</Label>
                        <Select value={facultyId} onValueChange={setFacultyId}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Выберите факультет" />
                            </SelectTrigger>
                            <SelectContent>
                                {faculties.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Название *</Label>
                            <Input
                                className="bg-zinc-950 border-zinc-800"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Код (ID) *</Label>
                            <Input
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
                            className="bg-zinc-950 border-zinc-800 resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Руководитель</Label>
                            <Select value={headTeacherId} onValueChange={setHeadTeacherId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Не назначен" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.firstName} {t.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(s) => setStatus(s as DepartmentStatus)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Активна</SelectItem>
                                    <SelectItem value="INACTIVE">Неактивна</SelectItem>
                                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
