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
import { Group } from "@/lib/types/group";
import { GroupStatusBadge, GroupLevelBadge, GroupPaymentBadge } from "./status-badge";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useModules } from "@/hooks/use-modules";

interface GroupsTableProps {
    groups: Group[];
    onEdit: (group: Group) => void;
}

export function GroupsTable({ groups, onEdit }: GroupsTableProps) {
    const router = useRouter();
    const { modules } = useModules();

    const handleAction = (action: string, id: string) => {
        if (action === 'archive') {
            if (!confirm("Вы уверены, что хотите архивировать эту группу?")) return;
        }
        alert(`Action ${action} triggered for group ${id}`);
    };

    if (groups.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2">Группы не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте новую группу</p>
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
                        <TableHead>Название / Код</TableHead>
                        {(modules.faculties || modules.departments) && <TableHead>Факультет / Кафедра</TableHead>}
                        <TableHead>Статус</TableHead>
                        <TableHead>Уровень</TableHead>
                        <TableHead>Студенты</TableHead>
                        <TableHead>Оплата</TableHead>
                        <TableHead>Куратор</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <TableRow
                            key={group.id}
                            className="hover:bg-card/50 border-border cursor-pointer group"
                            onClick={() => router.push(`/app/groups/${group.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-border data-[state=checked]:bg-primary" />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{group.name}</span>
                                    <span className="text-muted-foreground text-xs font-mono">{group.code}</span>
                                </div>
                            </TableCell>
                            {(modules.faculties || modules.departments) && (
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {modules.faculties && (
                                            <Badge variant="secondary" className="bg-secondary text-foreground w-fit text-[10px]">
                                                ID: {group.facultyId}
                                            </Badge>
                                        )}
                                        {modules.departments && (
                                            <span className="text-muted-foreground text-xs text-[10px]">ID: {group.departmentId}</span>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>
                                <GroupStatusBadge status={group.status} />
                            </TableCell>
                            <TableCell>
                                <GroupLevelBadge level={group.level} />
                            </TableCell>
                            <TableCell className="text-foreground">
                                <span className={group.studentsCount >= group.maxStudents ? "text-amber-500 font-bold" : ""}>
                                    {group.studentsCount}
                                </span>
                                <span className="text-muted-foreground"> / {group.maxStudents}</span>
                            </TableCell>
                            <TableCell>
                                <GroupPaymentBadge type={group.paymentType} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {group.curatorTeacherId || <span className="text-muted-foreground italic">Не назначен</span>}
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
                                        <DropdownMenuItem onClick={() => router.push(`/app/groups/${group.id}`)} className="cursor-pointer hover:bg-secondary">
                                            <Eye className="mr-2 h-4 w-4" /> Открыть
                                        </DropdownMenuItem>

                                        {group.status !== 'ARCHIVED' && (
                                            <DropdownMenuItem onClick={() => onEdit(group)} className="cursor-pointer hover:bg-secondary">
                                                <Edit className="mr-2 h-4 w-4" /> Редактировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-secondary" />

                                        {group.status === 'INACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('activate', group.id)} className="text-green-400 cursor-pointer hover:bg-secondary hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {group.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('deactivate', group.id)} className="text-amber-400 cursor-pointer hover:bg-secondary hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Сделать неактивной
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => handleAction('archive', group.id)} className="text-muted-foreground cursor-pointer hover:bg-secondary">
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
