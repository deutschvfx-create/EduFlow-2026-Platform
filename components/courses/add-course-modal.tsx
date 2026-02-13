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
import { Faculty } from "@/lib/types/faculty";
import { Department } from "@/lib/types/department";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";
import { useModules } from "@/hooks/use-modules";
import { Course, CourseType } from "@/lib/types/course";

interface AddCourseModalProps {
    onSuccess?: (course: Course) => void;
}

export function AddCourseModal({ onSuccess }: AddCourseModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentOrganizationId } = useOrganization();
    const { modules } = useModules();

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allDepartments, setAllDepartments] = useState<Department[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            Promise.all([
                import("@/lib/data/faculties.repo").then(m => m.facultiesRepo.getAll(currentOrganizationId)),
                import("@/lib/data/departments.repo").then(m => m.departmentsRepo.getAll(currentOrganizationId))
            ]).then(([f, d]) => {
                setFaculties(f);
                setAllDepartments(d);
            });
        }
    }, [open, currentOrganizationId]);

    // Derived state
    const departments = allDepartments.filter(d => d.facultyId === facultyId);

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
        const isFacultyRequired = modules.faculties;
        const isDepartmentRequired = modules.departments;

        if (!name || !code || (isFacultyRequired && !facultyId) || (isDepartmentRequired && !departmentId) || !currentOrganizationId) {
            alert(`Заполните обязательные поля: Название, Код${isFacultyRequired ? ', Факультет' : ''}${isDepartmentRequired ? ', Кафедра' : ''}`);
            return;
        }

        setLoading(true);

        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");

            const newCourse: Course = {
                id: generateId(),
                organizationId: currentOrganizationId,
                version: "v2026",
                name,
                code,
                type: "MANDATORY" as CourseType,
                facultyId: modules.faculties ? facultyId : "none",
                departmentId: modules.departments ? departmentId : "none",
                level: "",
                description: "",
                objective: "",
                status: 'ACTIVE',
                workload: {
                    hoursPerWeek: 0,
                    hoursPerSemester: 0,
                    hoursPerYear: 0
                },
                basePrice: undefined,
                currency: "RUB",
                format: "OFFLINE",
                grouping: "GROUP",
                teacherIds: [],
                groupIds: [],
                modules: [],
                teachers: [],
                grading: {
                    type: "5_POINT",
                    rounding: "NEAREST",
                    minPassScore: 3,
                    weights: { exams: 40, control: 30, homework: 20, participation: 10 }
                },
                materials: [],
                events: [],
                createdAt: new Date().toISOString()
            };

            await coursesRepo.add(currentOrganizationId, newCourse);

            setOpen(false);

            // Reset form
            setName("");
            setCode("");
            setFacultyId("");
            setDepartmentId("");

            if (onSuccess) {
                onSuccess(newCourse);
            } else {
                window.location.reload();
            }
        } catch (e: any) {
            console.error(e);
            alert("Ошибка при создании предмета: " + (e.message || e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="xs"
                    className="!h-6 !px-2.5 bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white font-black text-[9px] uppercase tracking-[0.05em] rounded-full shadow-md shadow-[#0F4C3D]/20 flex items-center gap-1 transition-all font-inter active:scale-95 shrink-0 border-none"
                >
                    <Plus className="h-2.5 w-2.5" />
                    <span>Добавить</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] bg-card border-border text-foreground overflow-hidden p-0 rounded-[28px] border-none shadow-2xl">
                <div className="p-8 space-y-8">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-[24px] font-black text-[#0F172A] tracking-tight leading-none">Новый курс</DialogTitle>
                        <DialogDescription className="text-[13px] font-medium text-[#64748B]">
                            Введите основные данные для быстрого создания курса
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Название курса</Label>
                            <Input
                                placeholder="Например: General English"
                                className="h-11 bg-[#F1F5F9] border-none text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] rounded-[14px] focus-visible:ring-2 focus-visible:ring-[#0F4C3D]/20 transition-all"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Код (ID)</Label>
                            <Input
                                placeholder="ENG-101"
                                className="h-11 bg-[#F1F5F9] border-none font-mono text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] rounded-[14px] uppercase focus-visible:ring-2 focus-visible:ring-[#0F4C3D]/20 transition-all"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        {(modules.faculties || modules.departments) && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {modules.faculties && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest pl-1">Факультет</Label>
                                        <Select value={facultyId} onValueChange={handleFacultyChange}>
                                            <SelectTrigger className="h-11 bg-[#F1F5F9] border-none text-[13px] font-bold text-[#0F172A] rounded-[14px] focus:ring-2 focus:ring-[#0F4C3D]/20 transition-all">
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
                                            <SelectTrigger className="h-11 bg-[#F1F5F9] border-none text-[13px] font-bold text-[#0F172A] rounded-[14px] focus:ring-2 focus:ring-[#0F4C3D]/20 transition-all">
                                                <SelectValue placeholder="Выбрать" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-[18px] border-none shadow-xl p-1">
                                                {departments.map(d => (
                                                    <SelectItem key={d.id} value={d.id} className="rounded-[10px] text-[13px] font-medium py-2.5">{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="h-12 w-full bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#0F4C3D]/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Создать курс
                        </Button>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-transparent transition-colors">
                            Отмена
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
