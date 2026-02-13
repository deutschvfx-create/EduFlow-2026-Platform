'use client';

import { useState } from "react";
import { Group } from "@/lib/types/group";
import { Search, Plus, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AddGroupModal } from "@/components/groups/add-group-modal";

interface ChatSidebarGroupsProps {
    groups: Group[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ChatSidebarGroups({ groups, selectedId, onSelect }: ChatSidebarGroupsProps) {
    const [search, setSearch] = useState("");

    const filtered = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--card))] flex-1">
            {/* Header */}
            <div className="p-6 flex flex-col items-center gap-4">
                <AddGroupModal customTrigger={
                    <button className="bg-muted hover:bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full transition-all shadow-xl active:scale-95 w-full">
                        ДОБАВИТ ГРУППУ
                    </button>
                } />
            </div>

            {/* Search */}
            <div className="px-6 pb-6 mt-4">
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4 text-center">ПОИСК</p>
                <div className="relative">
                    <Input
                        placeholder=""
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[hsl(var(--accent))] border-none rounded-full h-9 text-[11px] font-bold uppercase tracking-widest text-foreground text-center focus:ring-0"
                    />
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 px-4">
                <div className="grid grid-cols-2 gap-3 pb-6">
                    {filtered.map(group => (
                        <div
                            key={group.id}
                            onClick={() => onSelect(group.id)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center p-3 rounded-[1.5rem] cursor-pointer transition-all duration-300 group relative overflow-hidden",
                                selectedId === group.id
                                    ? "bg-[hsl(var(--accent))] shadow-2xl scale-95"
                                    : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]"
                            )}
                        >
                            <span className="text-[10px] font-black text-foreground uppercase tracking-tighter text-center leading-tight">{group.name}</span>
                            <div className="absolute inset-0 border-2 border-border rounded-[1.5rem] group-hover:border-border transition-colors pointer-events-none" />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
