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

interface FacultyCardProps {
    faculty: Faculty;
    onEdit: (faculty: Faculty) => void;
}

export function FacultyCard({ faculty, onEdit }: FacultyCardProps) {
    const statusStyles = {
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
            badge: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
            dot: "bg-zinc-500",
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
            className={`group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 ${style.border} border-l-4 rounded-2xl p-5 shadow-xl hover:shadow-indigo-500/5 transition-all ring-1 ring-white/5`}
        >
            {/* Top Row: Code & Actions */}
            <div className="flex items-center justify-between mb-4">
                <Badge className={`font-black tracking-widest text-[10px] uppercase px-2 shadow-sm ${style.badge}`}>
                    {faculty.code}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800">
                        <DropdownMenuItem onClick={() => onEdit(faculty)} className="text-zinc-400 focus:text-white focus:bg-zinc-900 cursor-pointer">
                            Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-zinc-400 focus:text-white focus:bg-zinc-900 cursor-pointer">
                            Статистика
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                            В архив
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-6 group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[3.5rem] leading-tight flex items-start">
                {faculty.name}
            </h3>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Кафедры</p>
                        <p className="text-sm font-black text-white">4</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Группы</p>
                        <p className="text-sm font-black text-white">12</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Students & Status */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-bold">120 Студентов</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/50 border border-zinc-800">
                    <div className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{style.label}</span>
                </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </motion.div>
    );
}
