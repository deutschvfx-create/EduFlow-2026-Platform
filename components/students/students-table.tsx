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
}

export function StudentsTable({ students }: StudentsTableProps) {
    const router = useRouter();

    const handleAction = (action: string, id: string) => {
        // Mock action
        if (action === 'delete') {
            if (!confirm("Вы уверены? Это действие нельзя отменить.")) return;
        }
        alert(`Action ${action} triggered for student ${id}`);
    };

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2 font-bold uppercase tracking-widest text-xs">Студенты не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового ученика</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="hover:bg-zinc-900 border-zinc-800/50">
                        <TableHead className="w-[40px] px-4">
                            <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600 rounded-md" />
                        </TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Студент</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden md:table-cell">Возраст / Дата рождения</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Статус</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden lg:table-cell">Группы / Курсы</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Баланс (время)</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Оплата</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-4">Управление</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow
                            key={student.id}
                            className="hover:bg-zinc-900/50 border-zinc-800/50 cursor-pointer group transition-colors"
                            onClick={() => router.push(`/app/students/${student.id}`)}
                        >
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600 rounded-md" />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-zinc-800 ring-1 ring-white/5 shadow-xl">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} alt={student.firstName} />
                                        <AvatarFallback className="bg-zinc-950 text-indigo-400 font-black text-xs">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {student.firstName} {student.lastName}
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-medium">
                                            {student.email || 'Нет email'}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col gap-0.5">
                                    <div className="text-sm text-zinc-300 font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-zinc-500" />
                                        {new Date(student.birthDate).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 uppercase font-black">
                                        {Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / 31536000000)} лет
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <StudentStatusBadge status={student.status} />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {(student.groups?.length || 0) > 0 ? (
                                        student.groups.map(g => (
                                            <Badge key={g.id} variant="secondary" className="bg-zinc-900/50 text-zinc-400 border border-zinc-800/50 text-[9px] px-1.5 py-0 h-5 font-bold uppercase tracking-tighter hover:bg-zinc-800 transition-colors">
                                                {g.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-zinc-700 text-[10px] font-bold uppercase italic">Без группы</span>
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
                                        <span className="text-zinc-700 font-black text-xs">—</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-4" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 shadow-2xl min-w-[160px]">
                                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 py-2">Контроль</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/students/${student.id}`)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-2">
                                            <Eye className="mr-2 h-4 w-4 text-zinc-400" /> Профиль студента
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-2">
                                            <CreditCard className="mr-2 h-4 w-4 text-zinc-400" /> История оплат
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-zinc-800" />

                                        {student.status !== 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('activate', student.id)} className="text-emerald-400 cursor-pointer hover:bg-emerald-500/10 focus:bg-emerald-500/10 py-2">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {student.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('suspend', student.id)} className="text-rose-400 cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 py-2">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => handleAction('archive', student.id)} className="text-zinc-500 cursor-pointer hover:bg-zinc-800 py-2">
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
