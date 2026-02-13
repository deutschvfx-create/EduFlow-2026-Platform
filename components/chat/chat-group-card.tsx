'use client';

import { Group } from "@/lib/types/group";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Layers } from "lucide-react";

interface ChatGroupCardProps {
    group: Group;
    onClick: (groupId: string) => void;
}

export function ChatGroupCard({ group, onClick }: ChatGroupCardProps) {
    const item = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <motion.div
            variants={item}
            whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)] transition-colors duration-500 cursor-pointer aspect-[3/4.5] flex flex-col"
            onClick={() => onClick(group.id)}
        >
            {/* Premium Header Gradient */}
            <div className="h-14 bg-gradient-to-br from-cyan-500/30 via-blue-500/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.2),transparent)]" />

                {/* Status Dot Top Left */}
                <div className="absolute top-2 left-2 z-20">
                    <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_5px_currentColor] 
                        ${group.status === 'ACTIVE' ? 'bg-emerald-500 text-emerald-500' :
                            group.status === 'ARCHIVED' ? 'bg-muted text-muted-foreground' :
                                'bg-amber-500 text-amber-500'}`}
                    />
                </div>

                <div className="absolute top-2 right-2 z-20">
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-border text-foreground text-[9px] h-4 px-1.5 font-bold shadow-lg">
                        {group.code}
                    </Badge>
                </div>
            </div>

            {/* Icon Section */}
            <div className="-mt-9 px-1 flex flex-col items-center z-10">
                <div className="h-16 w-16 rounded-2xl border-[3px] border-border bg-background flex items-center justify-center ring-1 ring-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Layers className="h-8 w-8 text-primary" />
                </div>

                <div className="mt-2 text-center w-full px-2 overflow-hidden">
                    <h3 className="text-[12px] font-black text-foreground truncate leading-tight tracking-tight drop-shadow-md" title={group.name}>
                        {group.name}
                    </h3>
                    <p className="text-[9px] font-bold text-muted-foreground truncate leading-tight uppercase tracking-tighter opacity-80 mt-1">
                        Кабинет группы
                    </p>
                </div>
            </div>

            {/* Bottom Information (Glassmorphism Section) */}
            <div className="mt-auto bg-background/80 backdrop-blur-md border-t border-border/50 p-2 group-hover:bg-background transition-colors">
                <div className="grid grid-cols-2 gap-1 opacity-90">
                    <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        <Users className="h-2.5 w-2.5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase">
                            {group.studentsCount || 0} СТ.
                        </span>
                    </div>
                    <div className="flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        <BookOpen className="h-2.5 w-2.5 text-purple-400" />
                        <span className="text-[10px] font-black text-purple-300 uppercase">
                            {group.coursesCount || 0} ПР.
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
