'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, Eye, Edit, Users, GraduationCap } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course } from "@/lib/types/course";
import { CourseStatusBadge, CourseLevelBadge } from "./status-badge";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useModules } from "@/hooks/use-modules";

interface CoursesTableProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onAssignTeachers: (course: Course) => void;
    onLinkGroups: (course: Course) => void;
}

export function CoursesTable({ courses, onEdit, onAssignTeachers, onLinkGroups }: CoursesTableProps) {
    const router = useRouter();
    const { modules } = useModules();

    const handleAction = (action: string, id: string) => {
        if (action === 'archive') {
            if (!confirm("Вы уверены, что хотите архивировать этот курс?")) return;
        }
        alert(`Action ${action} triggered for course ${id}`);
    };

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-card/30 rounded-xl border border-border/50 border-dashed">
                <p className="text-muted-foreground mb-2 font-medium">Курсы не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте новый курс</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30">
            <Table>
                <TableHeader className="bg-card/50">
                    <TableRow className="hover:bg-card/50 border-border/50">
                        <TableHead className="w-[50px] h-11">
                            <Checkbox className="border-border data-[state=checked]:bg-primary" />
                        </TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Название / Код</TableHead>
                        {(modules.faculties || modules.departments) && <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Факультет / Кафедра</TableHead>}
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Статус</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Преподаватели</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Группы</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Уровень</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Стоимость</TableHead>
                        <TableHead className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow
                            key={course.id}
                            className="hover:bg-secondary/20 border-border/50 cursor-pointer group transition-colors duration-150"
                            onClick={() => router.push(`/app/courses/${course.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()} className="py-4">
                                <Checkbox className="border-border data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-foreground text-sm">{course.name}</span>
                                    <span className="text-muted-foreground text-xs font-mono">{course.code}</span>
                                </div>
                            </TableCell>
                            {(modules.faculties || modules.departments) && (
                                <TableCell className="py-4">
                                    <div className="flex flex-col gap-1">
                                        {modules.faculties && (
                                            <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground w-fit text-[10px] font-medium">
                                                ID: {course.facultyId}
                                            </Badge>
                                        )}
                                        {modules.departments && (
                                            <span className="text-muted-foreground text-xs">ID: {course.departmentId}</span>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                            <TableCell className="py-4">
                                <CourseStatusBadge status={course.status} />
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(course.teacherIds?.length || 0) > 0 ? (
                                        <Badge variant="outline" className="border-border/50 text-muted-foreground text-[10px] bg-card/50 font-medium">
                                            {course.teacherIds.length} чел.
                                        </Badge>
                                    ) : <span className="text-muted-foreground italic text-xs">Нет</span>}
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(course.groupIds?.length || 0) > 0 ? (
                                        <Badge variant="outline" className="border-primary/20 text-primary text-[10px] bg-primary/10 font-medium">
                                            {course.groupIds.length} групп
                                        </Badge>
                                    ) : <span className="text-muted-foreground italic text-xs">Нет</span>}
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <CourseLevelBadge level={course.level} />
                            </TableCell>
                            <TableCell className="py-4">
                                {course.basePrice ? (
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground">
                                            {course.basePrice.toLocaleString()} {course.currency === 'USD' ? '$' : course.currency === 'EUR' ? '€' : course.currency === 'TJS' ? 'смн' : '₽'}
                                        </span>
                                    </div>
                                ) : <span className="text-muted-foreground text-xs italic">—</span>}
                            </TableCell>
                            <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Действия</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/courses/${course.id}`)} className="cursor-pointer hover:bg-secondary text-sm">
                                            <Eye className="mr-2 h-4 w-4" /> Открыть
                                        </DropdownMenuItem>

                                        {course.status !== 'ARCHIVED' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onEdit(course)} className="cursor-pointer hover:bg-secondary text-sm">
                                                    <Edit className="mr-2 h-4 w-4" /> Редактировать
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAssignTeachers(course)} className="cursor-pointer hover:bg-secondary text-sm">
                                                    <GraduationCap className="mr-2 h-4 w-4" /> Назначить препод.
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onLinkGroups(course)} className="cursor-pointer hover:bg-secondary text-sm">
                                                    <Users className="mr-2 h-4 w-4" /> Привязать группы
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        <DropdownMenuSeparator className="bg-secondary" />

                                        <DropdownMenuItem onClick={() => handleAction('archive', course.id)} className="text-muted-foreground cursor-pointer hover:bg-secondary text-sm">
                                            <Archive className="mr-2 h-4 w-4" /> В архив
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
