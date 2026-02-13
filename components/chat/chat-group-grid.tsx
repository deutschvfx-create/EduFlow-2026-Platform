'use client';

import { Group } from "@/lib/types/group";
import { ChatGroupCard } from "./chat-group-card";
import { motion } from "framer-motion";

interface ChatGroupGridProps {
    groups: Group[];
    onGroupSelect: (groupId: string) => void;
}

export function ChatGroupGrid({ groups, onGroupSelect }: ChatGroupGridProps) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-20 bg-card/50 rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground mb-2 font-bold uppercase tracking-widest text-xs">Группы не найдены</p>
                <p className="text-sm text-muted-foreground">Сначала создайте учебную группу в разделе "Структура"</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 p-1"
        >
            {groups.map((group) => (
                <ChatGroupCard
                    key={group.id}
                    group={group}
                    onClick={onGroupSelect}
                />
            ))}
        </motion.div>
    );
}
