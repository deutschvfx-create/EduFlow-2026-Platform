'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganization } from "@/hooks/use-organization";
import { useModules } from "@/hooks/use-modules";
import { Teacher } from "@/lib/types/teacher";
import { Faculty } from "@/lib/types/faculty";
import { Department } from "@/lib/types/department";
import { Group, GroupStatus } from "@/lib/types/group";
import { useTeachers } from "@/hooks/use-teachers";
import { useFaculties } from "@/hooks/use-faculties";
import { useDepartments } from "@/hooks/use-departments";

interface EditGroupModalProps {
    group: Group | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Group>) => void;
}

export function EditGroupModal({ group, open, onOpenChange, onSave }: EditGroupModalProps) {
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();
    const [loading, setLoading] = useState(false);

    // Real-time Data
    const { teachers } = useTeachers();
    const { faculties } = useFaculties();
    const { departments: allDepartments } = useDepartments();

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [level, setLevel] = useState("");
    const [paymentType, setPaymentType] = useState<"FREE" | "PAID">("FREE");
    const [curatorId, setCuratorId] = useState("");
    const [maxStudents, setMaxStudents] = useState("15");
    const [status, setStatus] = useState<GroupStatus>("ACTIVE");
    // Removed local state for teachers/faculties/departments

    useEffect(() => {
        if (group) {
            setName(group.name);
            setCode(group.code);
            setFacultyId(group.facultyId);
            setDepartmentId(group.departmentId);
            setLevel(group.level || "");
            setPaymentType(group.paymentType || "FREE");
            setCuratorId(group.curatorTeacherId || "");
            setMaxStudents(group.maxStudents.toString());
            setStatus(group.status);
        }
    }, [group]);

    // Derived state
    const departments = allDepartments.filter(d => d.facultyId === facultyId);

    const handleFacultyChange = (val: string) => {
        setFacultyId(val);
        setDepartmentId(""); // Reset department when faculty changes
    }

    const handleSubmit = async () => {
        if (!group) return;
        const isFacultyRequired = modules.faculties;
        const isDepartmentRequired = modules.departments;

        if (!name || !code || (isFacultyRequired && !facultyId) || (isDepartmentRequired && !departmentId)) {
            alert("Заполните обязательные поля");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 600));

        onSave(group.id, {
            name,
            code,
            facultyId,
            departmentId,
            level,
            paymentType,
            curatorTeacherId: curatorId,
            maxStudents: parseInt(maxStudents) || 15,
            status,
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!group) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Редактирование группы</DialogTitle>
                    <DialogDescription>Изменение данных группы {group.code}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {modules.faculties && (
                            <div className="space-y-2">
                                <Label>Факультет *</Label>
                                <Select value={facultyId} onValueChange={handleFacultyChange}>
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
                        )}
                        {modules.departments && (
                            <div className="space-y-2">
                                <Label>Кафедра *</Label>
                                <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId && modules.faculties}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                        <SelectValue placeholder={(!facultyId && modules.faculties) ? "Сначала выберите факультет" : "Выберите кафедру"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Уровень</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите уровень" />
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
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Тип оплаты</Label>
                            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as "FREE" | "PAID")}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Тип оплаты" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FREE">Бесплатно (Бюджет)</SelectItem>
                                    <SelectItem value="PAID">Платно (Коммерция)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(s) => setStatus(s as GroupStatus)}>
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
                        <div className="col-span-1 space-y-2">
                            <Label>Куратор</Label>
                            <Select value={curatorId} onValueChange={setCuratorId}>
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
                        <div className="col-span-1 space-y-2">
                            <Label>Лимит</Label>
                            <Input
                                type="number"
                                className="bg-zinc-950 border-zinc-800"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(e.target.value)}
                            />
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
