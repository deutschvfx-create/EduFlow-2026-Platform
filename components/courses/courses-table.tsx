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
import { MoreHorizontal, Archive, Eye, Edit, ShieldAlert, Shield, Users, GraduationCap } from "lucide-react";
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
            if (!confirm("Вы уверены, что хотите архивировать этот предмет?")) return;
        }
        alert(`Action ${action} triggered for course ${id}`);
    };

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2">Предметы не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте новую дисциплину</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-900">
                    <TableRow className="hover:bg-zinc-900 border-zinc-800">
                        <TableHead className="w-[50px]">
                            <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                        </TableHead>
                        <TableHead>Название / Код</TableHead>
                        {(modules.faculties || modules.departments) && <TableHead>Факультет / Кафедра</TableHead>}
                        <TableHead>Статус</TableHead>
                        <TableHead>Преподаватели</TableHead>
                        <TableHead>Группы</TableHead>
                        <TableHead>Уровень</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow
                            key={course.id}
                            className="hover:bg-zinc-900/50 border-zinc-800 cursor-pointer group"
                            onClick={() => router.push(`/app/courses/${course.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-zinc-200">{course.name}</span>
                                    <span className="text-zinc-500 text-xs font-mono">{course.code}</span>
                                </div>
                            </TableCell>
                            {(modules.faculties || modules.departments) && (
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {modules.faculties && (
                                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 w-fit text-[10px]">
                                                ID: {course.facultyId}
                                            </Badge>
                                        )}
                                        {modules.departments && (
                                            <span className="text-zinc-500 text-xs">ID: {course.departmentId}</span>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>
                                <CourseStatusBadge status={course.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(course.teacherIds?.length || 0) > 0 ? (
                                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px] bg-zinc-900">
                                            {course.teacherIds.length} чел.
                                        </Badge>
                                    ) : <span className="text-zinc-600 italic text-xs">Нет</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(course.groupIds?.length || 0) > 0 ? (
                                        <Badge variant="outline" className="border-indigo-500/20 text-indigo-300 text-[10px] bg-indigo-500/5">
                                            {course.groupIds.length} групп
                                        </Badge>
                                    ) : <span className="text-zinc-600 italic text-xs">Нет</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <CourseLevelBadge level={course.level} />
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 group-hover:text-white">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/courses/${course.id}`)} className="cursor-pointer hover:bg-zinc-800">
                                            <Eye className="mr-2 h-4 w-4" /> Открыть
                                        </DropdownMenuItem>

                                        {course.status !== 'ARCHIVED' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onEdit(course)} className="cursor-pointer hover:bg-zinc-800">
                                                    <Edit className="mr-2 h-4 w-4" /> Редактировать
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAssignTeachers(course)} className="cursor-pointer hover:bg-zinc-800">
                                                    <GraduationCap className="mr-2 h-4 w-4" /> Назначить препод.
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onLinkGroups(course)} className="cursor-pointer hover:bg-zinc-800">
                                                    <Users className="mr-2 h-4 w-4" /> Привязать группы
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        <DropdownMenuSeparator className="bg-zinc-800" />

                                        <DropdownMenuItem onClick={() => handleAction('archive', course.id)} className="text-zinc-500 cursor-pointer hover:bg-zinc-800">
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
