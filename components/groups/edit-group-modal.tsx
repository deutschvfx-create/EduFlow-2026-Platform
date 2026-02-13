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
            <DialogContent className="sm:max-w-[600px] bg-white border-none p-0 overflow-hidden rounded-[28px] shadow-2xl">
                <div className="p-8">
                    <DialogHeader className="space-y-1 mb-8">
                        <DialogTitle className="text-[22px] font-black text-[#0F172A] tracking-tight uppercase">Редактирование группы</DialogTitle>
                        <DialogDescription className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest opacity-70">Изменение данных группы {group.code}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-2">
                        <div className="grid grid-cols-2 gap-6">
                            {modules.faculties && (
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Факультет *</Label>
                                    <Select value={facultyId} onValueChange={handleFacultyChange}>
                                        <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                            <SelectValue placeholder="Выберите факультет" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                            {faculties.map(f => (
                                                <SelectItem key={f.id} value={f.id} className="text-[12px] font-bold uppercase py-2.5">{f.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {modules.departments && (
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Кафедра *</Label>
                                    <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId && modules.faculties}>
                                        <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                            <SelectValue placeholder={(!facultyId && modules.faculties) ? "Сначала факультет" : "Выберите кафедру"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.id} className="text-[12px] font-bold uppercase py-2.5">{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Название группы *</Label>
                                <Input
                                    className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase shadow-none transition-all focus:ring-[#2563EB]/10"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Код (ID) *</Label>
                                <Input
                                    className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase shadow-none transition-all focus:ring-[#2563EB]/10"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Уровень</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                        <SelectValue placeholder="Выберите уровень" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                        <SelectItem value="A1" className="text-[12px] font-bold uppercase py-2.5">A1</SelectItem>
                                        <SelectItem value="A2" className="text-[12px] font-bold uppercase py-2.5">A2</SelectItem>
                                        <SelectItem value="B1" className="text-[12px] font-bold uppercase py-2.5">B1</SelectItem>
                                        <SelectItem value="B2" className="text-[12px] font-bold uppercase py-2.5">B2</SelectItem>
                                        <SelectItem value="C1" className="text-[12px] font-bold uppercase py-2.5">C1</SelectItem>
                                        <SelectItem value="1 курс" className="text-[12px] font-bold uppercase py-2.5">1 курс</SelectItem>
                                        <SelectItem value="2 курс" className="text-[12px] font-bold uppercase py-2.5">2 курс</SelectItem>
                                        <SelectItem value="3 курс" className="text-[12px] font-bold uppercase py-2.5">3 курс</SelectItem>
                                        <SelectItem value="4 курс" className="text-[12px] font-bold uppercase py-2.5">4 курс</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Тип обучения</Label>
                                <Select value={paymentType} onValueChange={(v) => setPaymentType(v as "FREE" | "PAID")}>
                                    <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                        <SelectValue placeholder="Тип оплаты" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                        <SelectItem value="FREE" className="text-[12px] font-bold uppercase py-2.5">Бесплатно (Бюджет)</SelectItem>
                                        <SelectItem value="PAID" className="text-[12px] font-bold uppercase py-2.5">Платно (Контракт)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Статус</Label>
                                <Select value={status} onValueChange={(s) => setStatus(s as GroupStatus)}>
                                    <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                        <SelectValue placeholder="Статус" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                        <SelectItem value="ACTIVE" className="text-[12px] font-bold uppercase py-2.5">Активна</SelectItem>
                                        <SelectItem value="INACTIVE" className="text-[12px] font-bold uppercase py-2.5">Неактивна</SelectItem>
                                        <SelectItem value="ARCHIVED" className="text-[12px] font-bold uppercase py-2.5">Архив</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Куратор</Label>
                                <Select value={curatorId} onValueChange={setCuratorId}>
                                    <SelectTrigger className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold uppercase transition-all focus:ring-[#2563EB]/10">
                                        <SelectValue placeholder="Не назначен" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[18px] border-[#E2E8F0] shadow-xl">
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="text-[12px] font-bold uppercase py-2.5">
                                                {t.firstName} {t.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider ml-1">Лимит</Label>
                                <Input
                                    type="number"
                                    className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-[15px] text-[12px] font-bold shadow-none transition-all focus:ring-[#2563EB]/10"
                                    value={maxStudents}
                                    onChange={(e) => setMaxStudents(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-10">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-14 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#2563EB]/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Сохранить изменения"
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-10 text-[11px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-transparent transition-colors uppercase tracking-widest"
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
