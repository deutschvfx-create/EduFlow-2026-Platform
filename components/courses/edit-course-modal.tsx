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
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Редактирование предмета</DialogTitle>
                    <DialogDescription>Изменение данных дисциплины {course.code}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <Label>Кафедра *</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId} disabled={!facultyId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
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
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(s) => setStatus(s as CourseStatus)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
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
                            className="bg-zinc-950 border-zinc-800 resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
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
