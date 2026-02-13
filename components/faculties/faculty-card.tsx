"use client";

import { Faculty } from "@/lib/types/faculty";
import { motion } from "framer-motion";
import {
    Building2,
    MoreVertical,
    Users,
    Layers,
    GraduationCap,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useModules } from "@/hooks/use-modules";
import { ActionGuard } from "@/components/auth/action-guard";

interface FacultyCardProps {
    faculty: Faculty;
    onEdit: (faculty: Faculty) => void;
}

export function FacultyCard({ faculty, onEdit }: FacultyCardProps) {
    const { modules } = useModules();
    const statusStyles = {
        // ... (rest of statusStyles)
        ACTIVE: {
            border: "border-l-emerald-500",
            badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            dot: "bg-emerald-500",
            label: "Активен"
        },
        INACTIVE: {
            border: "border-l-amber-500",
            badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            dot: "bg-amber-500",
            label: "Неактивен"
        },
        ARCHIVED: {
            border: "border-l-zinc-500",
            badge: "bg-muted/10 text-muted-foreground border-border/20",
            dot: "bg-muted",
            label: "Архив"
        }
    };

    const style = statusStyles[faculty.status as keyof typeof statusStyles] || statusStyles.ACTIVE;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`group relative bg-card/40 backdrop-blur-xl border border-border/50 ${style.border} border-l-4 rounded-2xl p-5 shadow-xl hover:shadow-cyan-500/5 transition-all ring-1 ring-white/5`}
        >
            {/* Top Row: Code & Actions */}
            <div className="flex items-center justify-between mb-4">
                <Badge className={`font-black tracking-widest text-[10px] uppercase px-2 shadow-sm ${style.badge}`}>
                    {faculty.code}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                        <ActionGuard actionLabel="Для редактирования факультета нужна учетная запись">
                            <DropdownMenuItem onClick={() => onEdit(faculty)} className="text-muted-foreground focus:text-foreground focus:bg-card cursor-pointer">
                                Редактировать
                            </DropdownMenuItem>
                        </ActionGuard>
                        <DropdownMenuItem className="text-muted-foreground focus:text-foreground focus:bg-card cursor-pointer">
                            Статистика
                        </DropdownMenuItem>
                        <ActionGuard actionLabel="Архивация доступна только зарегистрированным пользователям">
                            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                                В архив
                            </DropdownMenuItem>
                        </ActionGuard>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-6 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] leading-tight flex items-start">
                {faculty.name}
            </h3>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {(modules as any).departments !== false && (
                    <div className="flex items-center gap-2 bg-background/40 border border-border/50 rounded-xl p-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Кафедры</p>
                            <p className="text-sm font-black text-foreground">{faculty.departmentsCount || 0}</p>
                        </div>
                    </div>
                )}
                {(modules as any).groups !== false && (
                    <div className="flex items-center gap-2 bg-background/40 border border-border/50 rounded-xl p-2.5">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Группы</p>
                            <p className="text-sm font-black text-foreground">{faculty.groupsCount || 0}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Row: Students & Status */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-bold">120 Студентов</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/50 border border-border">
                    <div className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{style.label}</span>
                </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </motion.div>
    );
}
