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
import { Faculty } from "@/lib/types/faculty";
import { Department } from "@/lib/types/department";
import { Course, CourseStatus } from "@/lib/types/course";

interface EditCourseModalProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Course>) => void;
}

export function EditCourseModal({ course, open, onOpenChange, onSave }: EditCourseModalProps) {
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [level, setLevel] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<CourseStatus>("ACTIVE");
    const [basePrice, setBasePrice] = useState("");
    const [currency, setCurrency] = useState<'RUB' | 'USD' | 'EUR' | 'TJS'>('RUB');
    const [format, setFormat] = useState<"ONLINE" | "OFFLINE" | "HYBRID">("OFFLINE");
    const [grouping, setGrouping] = useState<"INDIVIDUAL" | "GROUP">("GROUP");
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

    useEffect(() => {
        if (course) {
            setName(course.name);
            setCode(course.code);
            setFacultyId(course.facultyId);
            setDepartmentId(course.departmentId);
            setLevel(course.level || "");
            setDescription(course.description || "");
            setStatus(course.status);
            setBasePrice(course.basePrice?.toString() || "");
            setCurrency(course.currency || 'RUB');
            setFormat(course.format || "OFFLINE");
            setGrouping(course.grouping || "GROUP");
        }
    }, [course]);

    // Derived state
    const departments = allDepartments.filter(d => d.facultyId === facultyId);

    const handleFacultyChange = (val: string) => {
        setFacultyId(val);
        setDepartmentId(""); // Reset department when faculty changes
    }

    const handleSubmit = async () => {
        if (!course) return;
        if (!name || !code || !facultyId || !departmentId) {
            alert("Заполните обязательные поля");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 600));

        onSave(course.id, {
            name,
            code,
            facultyId,
            departmentId,
            level,
            description,
            status,
            basePrice: parseInt(basePrice) || undefined,
            currency,
            format,
            grouping,
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-[20px] font-black text-[#0F172A] tracking-tight">Редактировать курс</DialogTitle>
                    <DialogDescription>Изменение данных курса {course.code}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Факультет *</Label>
                            <Select value={facultyId} onValueChange={handleFacultyChange}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Выберите факультет" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Кафедра *</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId}>
                                <SelectTrigger className="bg-background border-border">
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
                                className="bg-background border-border"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground">Формат *</Label>
                                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                        <SelectTrigger className="h-9 bg-secondary/20 border-border/50 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OFFLINE">🏛 Офлайн</SelectItem>
                                            <SelectItem value="ONLINE">💻 Онлайн</SelectItem>
                                            <SelectItem value="HYBRID">🔄 Гибрид</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground">Группа/Инд. *</Label>
                                    <Select value={grouping} onValueChange={(v: any) => setGrouping(v)}>
                                        <SelectTrigger className="h-9 bg-secondary/20 border-border/50 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GROUP">👥 Группа</SelectItem>
                                            <SelectItem value="INDIVIDUAL">👤 Индивидуально</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Код (ID) *</Label>
                            <Input
                                className="bg-background border-border uppercase"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Уровень</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Выберите уровень" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A1.1">A1.1 (Beginner 1)</SelectItem>
                                    <SelectItem value="A1.2">A1.2 (Beginner 2)</SelectItem>
                                    <SelectItem value="A2.1">A2.1 (Elementary 1)</SelectItem>
                                    <SelectItem value="A2.2">A2.2 (Elementary 2)</SelectItem>
                                    <SelectItem value="B1.1">B1.1 (Pre-Intermediate 1)</SelectItem>
                                    <SelectItem value="B1.2">B1.2 (Pre-Intermediate 2)</SelectItem>
                                    <SelectItem value="B2.1">B2.1 (Intermediate 1)</SelectItem>
                                    <SelectItem value="B2.2">B2.2 (Intermediate 2)</SelectItem>
                                    <SelectItem value="C1.1">C1.1 (Upper-Intermediate 1)</SelectItem>
                                    <SelectItem value="C1.2">C1.2 (Upper-Intermediate 2)</SelectItem>
                                    <SelectItem value="C2">C2 (Proficiency)</SelectItem>
                                    <SelectItem value="MANDATORY">Основной курс</SelectItem>
                                    <SelectItem value="ELECTIVE">Спецкурс / По выбору</SelectItem>
                                    <SelectItem value="OPTIONAL">Факультатив (кружок)</SelectItem>
                                    <SelectItem value="INTENSIVE">Интенсив / Мастер-класс</SelectItem>
                                    <SelectItem value="3 курс">3 курс</SelectItem>
                                    <SelectItem value="4 курс">4 курс</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(s) => setStatus(s as CourseStatus)}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Активен</SelectItem>
                                    <SelectItem value="INACTIVE">Неактивен</SelectItem>
                                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            className="bg-background border-border resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Базовая стоимость</Label>
                            <Input
                                type="number"
                                className="bg-background border-border"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Валюта</Label>
                            <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                                    <SelectItem value="TJS">TJS (смн)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold">Отмена</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-10 px-6 bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white font-bold rounded-full shadow-lg shadow-[#0F4C3D]/20 transition-all active:scale-95"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
