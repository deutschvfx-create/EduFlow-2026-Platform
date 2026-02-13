'use client';

import { Student } from "@/lib/types/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentStatusBadge } from "./status-badge";
import { CreditCountdown } from "./credit-countdown";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, AlertCircle, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface StudentCardsProps {
    students: Student[];
    onAction: (action: string, id: string) => void;
}

export function StudentCards({ students, onAction }: StudentCardsProps) {
    const router = useRouter();

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2 font-bold uppercase tracking-widest text-xs">Студенты не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте нового ученика</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
            {students.map((student) => {
                return (
                    <motion.div
                        key={student.id}
                        variants={item}
                        className="group relative flex items-center gap-4 bg-white border border-[#DDE7EA] rounded-[14px] p-4 h-[100px] hover:border-[#2EC4C6] hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => router.push(`/app/students/${student.id}`)}
                    >
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-[#FAFAF2] shadow-sm flex-shrink-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} />
                            <AvatarFallback className="bg-[#FAFAF2] text-[#0F3D4C] font-bold text-xs">
                                {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-bold text-[#0F3D4C] truncate leading-tight mb-1">
                                {student.firstName} {student.lastName}
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-[#0F3D4C]/60 text-xs font-semibold">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{student.groupIds?.length || 0} гр.</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-[#DDE7EA]" />
                                <Badge variant="ghost" className={`h-5 text-[10px] font-bold px-2 rounded-full border border-current/20 
                                    ${student.status === 'ACTIVE' ? 'bg-[#2EC4C6]/10 text-[#2EC4C6]' :
                                        student.status === 'SUSPENDED' ? 'bg-red-50 text-red-500 border-red-200' :
                                            'bg-amber-50 text-amber-500 border-amber-200'}`}>
                                    {student.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#0F3D4C]/40 hover:text-[#0F3D4C] hover:bg-[#FAFAF2]">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-[#DDE7EA] text-[#0F3D4C]">
                                    <DropdownMenuItem onClick={() => router.push(`/app/students/${student.id}`)}>Профиль</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction('activate', student.id)}>Активировать</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction('suspend', student.id)} className="text-red-500">Заблокировать</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
