'use client';

import { useState } from "react";
import { Student } from "@/lib/types/student";
import { Teacher } from "@/lib/types/teacher";
import { Search, UserPlus, Users, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { AddStudentModal } from "@/components/groups/add-student-modal";

interface ChatSidebarContactsProps {
    selectedId: string | null;
    onSelect: (id: string, type: 'student' | 'teacher') => void;
    activeTab: 'student' | 'teacher';
}

export function ChatSidebarContacts({ selectedId, onSelect, activeTab }: ChatSidebarContactsProps) {
    const { students, loading: studentsLoading } = useStudents();
    const { teachers, loading: teachersLoading } = useTeachers();
    const [search, setSearch] = useState("");

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    const filteredTeachers = teachers.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--card))] flex-1">
            {/* Header */}
            <div className="p-6 flex flex-col items-center gap-4">
                <AddStudentModal customTrigger={
                    <button className="bg-muted hover:bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full transition-all shadow-xl active:scale-95 w-full">
                        ДОБАВИТ УЧЕНИК
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
            <ScrollArea className="flex-1 px-4 pb-6">
                {(studentsLoading || teachersLoading) ? (
                    <div className="p-10 text-center">
                        <div className="h-6 w-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Загрузка...</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {activeTab === 'teacher' ? (
                            filteredTeachers.map(teacher => (
                                <ContactItem
                                    key={teacher.id}
                                    id={teacher.id}
                                    name={`${teacher.firstName} ${teacher.lastName}`}
                                    status="online" // Placeholder
                                    isSelected={selectedId === teacher.id}
                                    onClick={() => onSelect(teacher.id, 'teacher')}
                                />
                            ))
                        ) : (
                            filteredStudents.map(student => (
                                <ContactItem
                                    key={student.id}
                                    id={student.id}
                                    name={`${student.firstName} ${student.lastName}`}
                                    status="online" // Placeholder
                                    isSelected={selectedId === student.id}
                                    onClick={() => onSelect(student.id, 'student')}
                                />
                            ))
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function ContactItem({ name, status, isSelected, onClick, id }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-2 rounded-full cursor-pointer transition-all duration-300 group relative",
                isSelected ? "bg-[hsl(var(--accent))]" : "hover:bg-[hsl(var(--secondary))]"
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                    <AvatarFallback className="bg-secondary text-[10px] font-black text-muted-foreground uppercase">
                        {name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-foreground truncate uppercase tracking-widest">{name}</p>
            </div>
        </div>
    );
}
