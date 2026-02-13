'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Check, X, UserCog, Users2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/hooks/use-organization";
import { Teacher } from "@/lib/types/teacher";
import { Course, TeacherAssignment } from "@/lib/types/course";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssignTeachersModalProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, teacherIds: string[], teachers?: TeacherAssignment[]) => void;
}

export function AssignTeachersModal({ course, open, onOpenChange, onSave }: AssignTeachersModalProps) {
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            import("@/lib/data/teachers.repo").then(({ teachersRepo }) => {
                teachersRepo.getAll(currentOrganizationId).then(setTeachers);
            });
        }
    }, [open, currentOrganizationId]);

    useEffect(() => {
        if (course) {
            // Initialize from course.teachers if available, otherwise from teacherIds
            if (course.teachers && course.teachers.length > 0) {
                setAssignments([...course.teachers]);
            } else {
                setAssignments(course.teacherIds.map(id => ({
                    userId: id,
                    role: "PRIMARY" as const,
                    permissions: {
                        manageGrades: true,
                        manageAttendance: true,
                        manageGroups: true,
                        manageMaterials: true,
                        manageEvents: true,
                        manageModules: true
                    }
                })));
            }
        } else {
            setAssignments([]);
        }
        setSearch("");
    }, [course]);

    const filteredTeachers = teachers.filter(t =>
        (t.firstName.toLowerCase().includes(search.toLowerCase()) ||
            t.lastName.toLowerCase().includes(search.toLowerCase())) &&
        !assignments.some(a => a.userId === t.id)
    );

    const addTeacher = (teacherId: string) => {
        setAssignments([...assignments, {
            userId: teacherId,
            role: "PRIMARY",
            permissions: {
                manageGrades: true,
                manageAttendance: true,
                manageGroups: true,
                manageMaterials: true,
                manageEvents: true,
                manageModules: true
            }
        }]);
    };

    const removeTeacher = (teacherId: string) => {
        setAssignments(assignments.filter(a => a.userId !== teacherId));
    };

    const updateRole = (teacherId: string, role: "PRIMARY" | "ASSISTANT" | "SUBSTITUTE") => {
        setAssignments(assignments.map(a => a.userId === teacherId ? { ...a, role } : a));
    };

    const getTeacherById = (id: string) => teachers.find(t => t.id === id);

    const handleSubmit = async () => {
        if (!course) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        onSave(course.id, assignments.map(a => a.userId), assignments);
        setLoading(false);
        onOpenChange(false);
    };

    if (!course) return null;

    const roleIcons = {
        PRIMARY: <UserCog className="h-3 w-3" />,
        ASSISTANT: <Users2 className="h-3 w-3" />,
        SUBSTITUTE: <UserPlus className="h-3 w-3" />
    };

    const roleLabels = {
        PRIMARY: "Основной",
        ASSISTANT: "Ассистент",
        SUBSTITUTE: "Замена"
    };

    const roleColors = {
        PRIMARY: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        ASSISTANT: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        SUBSTITUTE: "bg-muted/20 text-muted-foreground border-border/30"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Назначение преподавателей</DialogTitle>
                    <DialogDescription>Выберите преподавателей и их роли для предмета {course.name}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
                    {/* Assigned Teachers */}
                    {assignments.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Назначенные ({assignments.length})</div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {assignments.map(assignment => {
                                    const teacher = getTeacherById(assignment.userId);
                                    if (!teacher) return null;
                                    return (
                                        <div key={assignment.userId} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border border-border/50">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-foreground">{teacher.firstName} {teacher.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{teacher.specialization}</div>
                                            </div>
                                            <Select value={assignment.role} onValueChange={(v) => updateRole(assignment.userId, v as any)}>
                                                <SelectTrigger className="w-[140px] h-8 bg-card border-border text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PRIMARY">
                                                        <div className="flex items-center gap-2">
                                                            <UserCog className="h-3 w-3" />
                                                            Основной
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ASSISTANT">
                                                        <div className="flex items-center gap-2">
                                                            <Users2 className="h-3 w-3" />
                                                            Ассистент
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="SUBSTITUTE">
                                                        <div className="flex items-center gap-2">
                                                            <UserPlus className="h-3 w-3" />
                                                            Замена
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeTeacher(assignment.userId)}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Search & Add */}
                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Добавить преподавателя</div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск..."
                                className="pl-9 bg-background border-border"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="flex-1 border border-border rounded-md p-2 bg-background/30">
                            <div className="space-y-1">
                                {filteredTeachers.map(teacher => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => addTeacher(teacher.id)}
                                        className="flex items-center justify-between p-2 rounded cursor-pointer transition-colors hover:bg-secondary"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{teacher.firstName} {teacher.lastName}</span>
                                            <span className="text-xs text-muted-foreground">{teacher.specialization}</span>
                                        </div>
                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                                {filteredTeachers.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4 text-sm">
                                        {search ? "Преподаватели не найдены" : "Все преподаватели назначены"}
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="border-t border-border pt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
