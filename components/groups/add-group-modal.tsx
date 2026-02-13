'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";
import { useModules } from "@/hooks/use-modules";
import { Faculty } from "@/lib/types/faculty";
import { Department } from "@/lib/types/department";
import { Teacher } from "@/lib/types/teacher";

interface AddGroupModalProps {
    onSuccess?: (groupId: string) => void;
    customTrigger?: React.ReactNode;
}

export function AddGroupModal({ onSuccess, customTrigger }: AddGroupModalProps) {
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data lists
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allDepartments, setAllDepartments] = useState<Department[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [level, setLevel] = useState("");
    const [paymentType, setPaymentType] = useState<"FREE" | "PAID">("FREE");
    const [curatorId, setCuratorId] = useState("");
    const [maxStudents, setMaxStudents] = useState("15");

    useEffect(() => {
        if (open && currentOrganizationId) {
            loadMetaData();
        }
    }, [open, currentOrganizationId]);

    const loadMetaData = async () => {
        try {
            const [facM, depM, teaM] = await Promise.all([
                import("@/lib/data/faculties.repo"),
                import("@/lib/data/departments.repo"),
                import("@/lib/data/teachers.repo")
            ]);

            const [f, d, t] = await Promise.all([
                facM.facultiesRepo.getAll(currentOrganizationId!),
                depM.departmentsRepo.getAll(currentOrganizationId!),
                teaM.teachersRepo.getAll(currentOrganizationId!)
            ]);

            setFaculties(f);
            setAllDepartments(d);
            setTeachers(t);
        } catch (e) {
            console.error("Failed to load metadata", e);
        }
    };

    const handleFacultyChange = (val: string) => {
        setFacultyId(val);
        setDepartmentId("");
    }

    const handleNameChange = (val: string) => {
        setName(val);
        if (!code && val.length > 3) {
            const generated = val.split(' ').map(w => w[0]).join('').toUpperCase() + "-" + Math.floor(Math.random() * 100);
            setCode(generated);
        }
    }

    const handleSubmit = async () => {
        if (!name || !code || !currentOrganizationId) {
            alert("Заполните название и код группы");
            return;
        }

        setLoading(true);
        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            const newGroupId = generateId();
            await groupsRepo.add(currentOrganizationId, {
                id: newGroupId,
                organizationId: currentOrganizationId,
                name,
                code,
                facultyId: facultyId || "none",
                departmentId: departmentId || "none",
                level,
                paymentType,
                curatorTeacherId: curatorId || undefined,
                maxStudents: parseInt(maxStudents) || 15,
                studentsCount: 0,
                teachersCount: curatorId ? 1 : 0,
                coursesCount: 0,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            });

            setOpen(false);
            setName("");
            setCode("");
            setFacultyId("");
            setDepartmentId("");
            setLevel("");
            setPaymentType("FREE");
            setCuratorId("");

            if (onSuccess) {
                onSuccess(newGroupId);
            } else {
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            alert("Ошибка при создании группы");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger || (
                    <Button
                        size="xs"
                        className="!h-6 !px-2.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-black text-[9px] uppercase tracking-[0.05em] rounded-full shadow-md shadow-[#2563EB]/20 flex items-center gap-1 transition-all font-inter active:scale-95 shrink-0 border-none"
                    >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Добавить</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] bg-white border-none p-0 overflow-hidden rounded-[28px] shadow-2xl font-inter">
                <div className="p-8 space-y-8">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-[24px] font-black text-[#0F172A] tracking-tight leading-none">Новая группа</DialogTitle>
                        <DialogDescription className="text-[13px] font-medium text-[#64748B]">
                            Введите основные данные для быстрого создания потока
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Название группы</Label>
                            <Input
                                placeholder="Например: English A1"
                                className="h-11 bg-[#F1F5F9] border-none text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] rounded-[14px] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all uppercase"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Код (ID)</Label>
                            <Input
                                placeholder="Г-10"
                                className="h-11 bg-[#F1F5F9] border-none font-mono text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] rounded-[14px] uppercase focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        {(modules.faculties || modules.departments) && (
                            <div className="grid grid-cols-2 gap-3">
                                {modules.faculties && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Факультет</Label>
                                        <Select value={facultyId} onValueChange={handleFacultyChange}>
                                            <SelectTrigger className="h-11 bg-[#F1F5F9] border-none text-[13px] font-bold text-[#0F172A] rounded-[14px] focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
                                                <SelectValue placeholder="Выбрать" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-[18px] border-none shadow-xl p-1">
                                                {faculties.map(f => (
                                                    <SelectItem key={f.id} value={f.id} className="rounded-[10px] text-[13px] font-medium py-2.5">{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {modules.departments && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Кафедра</Label>
                                        <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId && modules.faculties}>
                                            <SelectTrigger className="h-11 bg-[#F1F5F9] border-none text-[13px] font-bold text-[#0F172A] rounded-[14px] focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
                                                <SelectValue placeholder="Выбрать" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-[18px] border-none shadow-xl p-1">
                                                {allDepartments.filter(d => d.facultyId === facultyId).map(d => (
                                                    <SelectItem key={d.id} value={d.id} className="rounded-[10px] text-[13px] font-medium py-2.5">{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Уровень</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger className="h-11 bg-[#F1F5F9] border-none text-[13px] font-bold text-[#0F172A] rounded-[14px] focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
                                        <SelectValue placeholder="Выбрать" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[18px] border-none shadow-xl p-1 max-h-[200px]">
                                        {['A1', 'A2', 'B1', 'B2', 'C1', '1 курс', '2 курс', '3 курс', '4 курс'].map(l => (
                                            <SelectItem key={l} value={l} className="rounded-[10px] text-[13px] font-medium py-2.5">{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Лимит мест</Label>
                                <Input
                                    type="number"
                                    className="h-11 bg-[#F1F5F9] border-none text-[14px] font-bold text-[#0F172A] rounded-[14px] focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all"
                                    value={maxStudents}
                                    onChange={(e) => setMaxStudents(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-12 w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#2563EB]/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Создать группу"}
                        </Button>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-transparent transition-colors uppercase tracking-widest">
                            Отмена
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
