'use client';

import { useState } from "react";
import { Search, CheckCheck, Clock, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGroups } from "@/hooks/use-groups";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";

interface ChatListProps {
    selectedId: string | null;
    selectedType: 'group' | 'student' | 'teacher' | null;
    onSelect: (id: string, type: 'group' | 'student' | 'teacher') => void;
    activeCategory: 'student' | 'teacher';
}

export function ChatList({ selectedId, selectedType, onSelect, activeCategory }: ChatListProps) {
    const { groups } = useGroups();
    const { students } = useStudents();
    const { teachers } = useTeachers();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<'all' | 'unread' | 'favorites'>('all');

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
    const filteredContacts = (activeCategory === 'student' ? students : teachers).filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--card))]">
            {/* Search and Filters */}
            <div className="p-3 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <Input
                        placeholder="Поиск или новый чат"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-card border-border rounded-lg pl-12 h-9 text-[14px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {['all', 'unread', 'favorites'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-3 py-1 rounded-full text-[13px] transition-colors",
                                filter === f
                                    ? "bg-[hsl(var(--primary))40] text-[hsl(var(--primary))] font-medium"
                                    : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                            )}
                        >
                            {f === 'all' && 'Все'}
                            {f === 'unread' && 'Непрочитанное'}
                            {f === 'favorites' && 'Избранное'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                <div className="py-2 space-y-0.5">
                    <div className="px-5 py-3 text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide opacity-80">Мои группы</div>
                    {filteredGroups.map(group => (
                        <ChatListItem
                            key={group.id}
                            title={group.name}
                            subtitle={group.code}
                            time="16:56"
                            unread={0}
                            isSelected={selectedId === group.id && selectedType === 'group'}
                            onClick={() => onSelect(group.id, 'group')}
                        />
                    ))}

                    <div className="px-5 py-5 text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide opacity-80">
                        {activeCategory === 'student' ? 'Студенты' : 'Преподаватели'}
                    </div>
                    {filteredContacts.map(contact => (
                        <ChatListItem
                            key={contact.id}
                            title={`${contact.firstName} ${contact.lastName}`}
                            subtitle="В сети"
                            time="15:42"
                            unread={activeCategory === 'teacher' ? 1 : 0}
                            isSelected={selectedId === contact.id && (selectedType === 'student' || selectedType === 'teacher')}
                            onClick={() => onSelect(contact.id, activeCategory)}
                            avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.id}`}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function ChatListItem({ title, subtitle, time, unread, isSelected, onClick, avatar }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 relative group mx-2 rounded-xl",
                isSelected
                    ? "bg-[hsl(var(--secondary))] shadow-md z-10"
                    : "hover:bg-[hsl(var(--secondary))]/50"
            )}
        >
            <div className="shrink-0 relative">
                <Avatar className="h-10 w-10 rounded-full border border-border shadow-sm transition-transform group-hover:scale-105">
                    {avatar && <AvatarImage src={avatar} />}
                    <AvatarFallback className="bg-[hsl(var(--accent))] text-muted-foreground font-bold text-xs">{title[0]}</AvatarFallback>
                </Avatar>
                {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[hsl(var(--primary))] rounded-full border-2 border-[hsl(var(--card))]" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className={cn(
                        "text-[14px] font-medium truncate transition-colors",
                        isSelected ? "text-foreground" : "text-[hsl(var(--foreground))] group-hover:text-foreground"
                    )}>{title}</h4>
                    <span className={cn(
                        "text-[10px] font-medium transition-colors",
                        unread > 0 ? "text-[hsl(var(--primary))]" : (isSelected ? "text-muted-foreground" : "text-[hsl(var(--muted-foreground))]")
                    )}>{time}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {isSelected && <CheckCheck className="h-3 w-3 text-[hsl(var(--primary))]" />}
                        <p className={cn(
                            "text-[12.5px] truncate transition-colors",
                            isSelected ? "text-muted-foreground" : "text-[hsl(var(--muted-foreground))] group-hover:text-muted-foreground"
                        )}>{subtitle}</p>
                    </div>
                    {unread > 0 && (
                        <div className="bg-[hsl(var(--primary))] text-[hsl(var(--card))] text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-sm">
                            {unread}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
