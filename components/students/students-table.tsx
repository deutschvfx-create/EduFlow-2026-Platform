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
import { MoreHorizontal, Shield, ShieldAlert, Archive, Trash2, Eye, CreditCard, Calendar } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Student } from "@/lib/types/student";
import { StudentStatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCountdown } from "./credit-countdown";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentsTableProps {
    students: Student[];
    onAction: (action: string, id: string) => void;
}

export function StudentsTable({ students, onAction }: StudentsTableProps) {
    const router = useRouter();

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2 font-bold uppercase tracking-widest text-xs">Студенты не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте нового ученика</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-card/50">
                    <TableRow className="hover:bg-card border-border/50">
                        <TableHead className="w-[40px] px-4">
                            <Checkbox className="border-border data-[state=checked]:bg-primary rounded-md" />
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Студент</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Возраст / Дата рождения</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Статус</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden laptop:table-cell">Группы / Курсы</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Баланс (время)</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Оплата</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4">Управление</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow
                            key={student.id}
                            className="hover:bg-card/50 border-border/50 cursor-pointer group transition-colors"
                            onClick={() => router.push(`/app/students/${student.id}`)}
                        >
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-border data-[state=checked]:bg-primary rounded-md" />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-border ring-1 ring-white/5 shadow-xl">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} alt={student.firstName} />
                                        <AvatarFallback className="bg-background text-primary font-black text-xs">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                            {student.firstName} {student.lastName}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-medium">
                                            {student.email || 'Нет email'}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col gap-0.5">
                                    <div className="text-sm text-foreground font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {new Date(student.birthDate).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black">
                                        {Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / 31536000000)} лет
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <StudentStatusBadge status={student.status} />
                            </TableCell>
                            <TableCell className="hidden laptop:table-cell">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(student.groupIds?.length || 0) > 0 ? (
                                        <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">
                                            {student.groupIds.length} {student.groupIds.length === 1 ? 'группа' : 'групп'}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-[10px] font-bold uppercase italic">Без группы</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <CreditCountdown paidUntil={student.paidUntil} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {student.paymentStatus === 'OK' && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Оплачено</span>
                                        </div>
                                    )}
                                    {student.paymentStatus === 'DUE' && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit">
                                            <div className="h-1 w-1 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Задолженность</span>
                                        </div>
                                    )}
                                    {student.paymentStatus === 'UNKNOWN' && (
                                        <span className="text-muted-foreground font-black text-xs">—</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-4" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground shadow-2xl min-w-[160px]">
                                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Контроль</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/students/${student.id}`)} className="cursor-pointer hover:bg-secondary focus:bg-secondary py-2">
                                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Профиль студента
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer hover:bg-secondary focus:bg-secondary py-2">
                                            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> История оплат
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-secondary" />

                                        {student.status !== 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => onAction('activate', student.id)} className="text-emerald-400 cursor-pointer hover:bg-emerald-500/10 focus:bg-emerald-500/10 py-2">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {student.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => onAction('suspend', student.id)} className="text-rose-400 cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 py-2">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => onAction('archive', student.id)} className="text-muted-foreground cursor-pointer hover:bg-secondary py-2">
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
