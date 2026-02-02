'use client';

import { Student } from "@/lib/types/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentStatusBadge } from "./status-badge";
import { CreditCountdown } from "./credit-countdown";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-2 p-2">
            {students.map((student, index) => (
                <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:bg-zinc-800/80 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg aspect-[4/5] flex flex-col"
                    onClick={() => router.push(`/app/students/${student.id}`)}
                >
                    {/* Compact Card Content */}
                    <div className="p-2 flex flex-col items-center flex-1">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-zinc-800 shadow-xl mb-2 group-hover:scale-110 transition-transform">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} />
                            <AvatarFallback className="bg-zinc-950 text-indigo-400 font-black text-[10px]">
                                {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center w-full px-1">
                            <h3 className="text-[11px] font-bold text-white truncate leading-tight mb-0.5">
                                {student.firstName}
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-400 truncate leading-tight">
                                {student.lastName}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="p-1.5 bg-black/40 border-t border-zinc-800/50 mt-auto">
                        <div className="flex justify-between items-center gap-1 mb-1">
                            <div className="scale-75 origin-left">
                                <StudentStatusBadge status={student.status} />
                            </div>
                            <div className="scale-75 origin-right">
                                {(student.groupIds?.length || 0) > 0 && (
                                    <Badge variant="outline" className="text-[8px] border-zinc-700 text-zinc-500 px-1 py-0 h-4">
                                        {student.groupIds?.length} гр.
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <div className="scale-75 origin-left w-[133%]">
                                <CreditCountdown paidUntil={student.paidUntil} />
                            </div>

                            {student.paymentStatus === 'DUE' && (
                                <div className="text-[8px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
                                    Долг
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover Overlay with basic actions or more info? */}
                </motion.div>
            ))}
        </div>
    );
}
