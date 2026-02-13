'use client';

import { Search, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddGroupModal } from "@/components/groups/add-group-modal";
import { motion, AnimatePresence } from "framer-motion";

interface ChatSidebarGroupsRightProps {
    groups: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ChatSidebarGroupsRight({ groups, selectedId, onSelect }: ChatSidebarGroupsRightProps) {
    return (
        <div className="w-[100px] bg-[hsl(var(--card))]/40 backdrop-blur-xl flex flex-col h-[calc(100vh-140px)] rounded-[3rem] border border-border overflow-hidden shrink-0 shadow-xl">
            {/* Compact Action Buttons */}
            <div className="p-4 flex flex-col items-center gap-4 border-b border-border bg-secondary/50">
                <AddGroupModal customTrigger={
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 168, 132, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[hsl(var(--primary))] text-[hsl(var(--card))] h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                        title="Добавить группу"
                    >
                        <Plus className="h-6 w-6 stroke-[3px]" />
                    </motion.button>
                } />
                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-secondary/50 text-muted-foreground h-10 w-10 rounded-full flex items-center justify-center transition-all"
                    title="Поиск"
                >
                    <Search className="h-4 w-4" />
                </motion.button>
            </div>

            {/* Groups List */}
            <ScrollArea className="flex-1 px-3">
                <div className="flex flex-col items-center gap-6 py-8">
                    {groups.map((group) => (
                        <motion.button
                            key={group.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(group.id)}
                            className={cn(
                                "h-14 w-14 rounded-2xl flex flex-col items-center justify-center transition-all relative group shrink-0",
                                selectedId === group.id
                                    ? "bg-[hsl(var(--primary))] shadow-lg shadow-primary/30 ring-2 ring-[hsl(var(--primary))]/50"
                                    : "bg-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))] text-muted-foreground border border-border"
                            )}
                        >
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter text-center px-1 leading-tight transition-colors",
                                selectedId === group.id ? "text-[hsl(var(--card))]" : "text-foreground/70 group-hover:text-foreground"
                            )}>
                                {group.name}
                            </span>
                        </motion.button>
                    ))}

                    {/* Empty placeholder squares */}
                    {[1, 2].map((i) => (
                        <div key={i} className="h-14 w-14 rounded-2xl bg-[hsl(var(--secondary))]/20 shrink-0 border border-border pointer-events-none opacity-40" />
                    ))}
                </div>
            </ScrollArea>

            {/* Bottom Avatar / Mascot - Reactive Animation */}
            <div className="p-4 mt-auto border-t border-border bg-secondary/50 flex justify-center">
                <motion.div
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    className="h-14 w-14 rounded-full bg-[hsl(var(--muted))] border border-border flex items-center justify-center p-2 relative shadow-inner group cursor-pointer transition-colors"
                >
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix" alt="Mascot" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-0.5 right-0.5 h-3 w-3 bg-[hsl(var(--primary))] rounded-full border-2 border-[hsl(var(--card))] shadow-md shadow-primary/20"
                    />
                </motion.div>
            </div>
        </div>
    );
}
