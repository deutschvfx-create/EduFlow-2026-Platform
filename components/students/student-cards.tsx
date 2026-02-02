'use client';

import { Student } from "@/lib/types/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentStatusBadge } from "./status-badge";
import { CreditCountdown } from "./credit-countdown";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, AlertCircle } from "lucide-react";

interface StudentCardsProps {
    students: Student[];
    onAction: (action: string, id: string) => void;
}

export function StudentCards({ students, onAction }: StudentCardsProps) {
    const router = useRouter();

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2 font-bold uppercase tracking-widest text-xs">Студенты не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового ученика</p>
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
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-3 p-1"
        >
            {students.map((student) => {
                const age = Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / 31536000000);
                const isDebt = student.paymentStatus === 'DUE';

                return (
                    <motion.div
                        key={student.id}
                        variants={item}
                        whileHover={{ y: -5 }}
                        className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-300 cursor-pointer aspect-[3/4.5] flex flex-col"
                        onClick={() => router.push(`/app/students/${student.id}`)}
                    >
                        {/* Premium Header Gradient */}
                        <div className="h-14 bg-gradient-to-br from-indigo-500/30 via-purple-500/10 to-transparent relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.2),transparent)]" />

                            {/* Age/Debt Tag - Like a price tag */}
                            <div className="absolute top-1.5 right-1.5 z-20">
                                {isDebt ? (
                                    <Badge className="bg-rose-600/90 text-white border-none text-[8px] h-4 px-1 font-black animate-pulse shadow-lg">
                                        ДОЛГ
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-zinc-950/50 backdrop-blur-md border-white/10 text-white text-[9px] h-4 px-1.5 font-bold shadow-lg">
                                        {age} л.
                                    </Badge>
                                )}
                            </div>

                            {/* Status Dot Top Left */}
                            <div className="absolute top-2 left-2 z-20">
                                <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_5px_currentColor] 
                                    ${student.status === 'ACTIVE' ? 'bg-emerald-500 text-emerald-500' :
                                        student.status === 'SUSPENDED' ? 'bg-rose-500 text-rose-500' :
                                            'bg-amber-500 text-amber-500'}`}
                                />
                            </div>
                        </div>

                        {/* Avatar Section */}
                        <div className="-mt-9 px-1 flex flex-col items-center z-10">
                            <Avatar className="h-14 w-14 border-[3px] border-zinc-900 ring-1 ring-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} />
                                <AvatarFallback className="bg-zinc-950 text-indigo-400 font-black text-[10px]">
                                    {student.firstName[0]}{student.lastName[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="mt-1.5 text-center w-full px-1 overflow-hidden">
                                <h3 className="text-[11px] font-black text-white truncate leading-tight tracking-tight drop-shadow-md" title={`${student.firstName} ${student.lastName}`}>
                                    {student.firstName}
                                </h3>
                                <p className="text-[9px] font-bold text-zinc-500 truncate leading-tight uppercase tracking-tighter opacity-80">
                                    {student.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Information (Glassmorphism Section) */}
                        <div className="mt-auto bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/50 p-1.5 group-hover:bg-zinc-950 transition-colors">
                            <div className="flex justify-between items-center gap-1 mb-1 opacity-90">
                                <div className="flex items-center gap-0.5 bg-indigo-500/10 px-1 py-0 rounded border border-indigo-500/20">
                                    <Users className="h-2 w-2 text-indigo-400" />
                                    <span className="text-[7px] font-black text-indigo-300 uppercase">
                                        {student.groupIds?.length || 0} ГР.
                                    </span>
                                </div>
                                <div className="scale-75 origin-right translate-x-1">
                                    <StudentStatusBadge status={student.status} />
                                </div>
                            </div>

                            <div className="scale-90 origin-left w-[111%] min-h-[30px] flex items-end">
                                <CreditCountdown paidUntil={student.paidUntil} />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
