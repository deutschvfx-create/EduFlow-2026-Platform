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
import { MoreHorizontal, Archive, Eye, Edit, ShieldAlert, Shield } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Department } from "@/lib/types/department";
import { DepartmentStatusBadge } from "./status-badge";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface DepartmentsTableProps {
    departments: Department[];
    onEdit: (department: Department) => void;
}

export function DepartmentsTable({ departments, onEdit }: DepartmentsTableProps) {
    const router = useRouter();

    const handleAction = (action: string, id: string) => {
        if (action === 'archive') {
            if (!confirm("Вы уверены, что хотите архивировать эту кафедру?")) return;
        }
        alert(`Action ${action} triggered for department ${id}`);
    };

    if (departments.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2">Кафедры не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте новую кафедру</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border overflow-hidden">
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-card border-border">
                        <TableHead className="w-[50px]">
                            <Checkbox className="border-border data-[state=checked]:bg-primary" />
                        </TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Факультет</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-center">Препод.</TableHead>
                        <TableHead className="text-center">Группы</TableHead>
                        <TableHead className="text-center">Студ.</TableHead>
                        <TableHead>Руководитель</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {departments.map((department) => (
                        <TableRow
                            key={department.id}
                            className="hover:bg-card/50 border-border cursor-pointer group"
                            onClick={() => router.push(`/app/departments/${department.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-border data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {department.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                                {department.code}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-secondary text-foreground font-normal">
                                    ID: {department.facultyId}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DepartmentStatusBadge status={department.status} />
                            </TableCell>
                            <TableCell className="text-center text-foreground">
                                {department.teachersCount}
                            </TableCell>
                            <TableCell className="text-center text-foreground">
                                {department.groupsCount}
                            </TableCell>
                            <TableCell className="text-center text-foreground">
                                {department.studentsCount}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {department.headTeacherId || <span className="text-muted-foreground italic">Не назначен</span>}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground group-hover:text-foreground">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/departments/${department.id}`)} className="cursor-pointer hover:bg-secondary">
                                            <Eye className="mr-2 h-4 w-4" /> Открыть
                                        </DropdownMenuItem>

                                        {department.status !== 'ARCHIVED' && (
                                            <DropdownMenuItem onClick={() => onEdit(department)} className="cursor-pointer hover:bg-secondary">
                                                <Edit className="mr-2 h-4 w-4" /> Редактировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-secondary" />

                                        {department.status === 'INACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('activate', department.id)} className="text-green-400 cursor-pointer hover:bg-secondary hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {department.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('deactivate', department.id)} className="text-amber-400 cursor-pointer hover:bg-secondary hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Сделать неактивной
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => handleAction('archive', department.id)} className="text-muted-foreground cursor-pointer hover:bg-secondary">
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
