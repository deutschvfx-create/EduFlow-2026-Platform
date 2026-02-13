'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ModuleGuard } from "@/components/system/module-guard";
import { ChatList } from "@/components/chat/chat-list";
import { ChatRoom } from "@/components/chat/chat-room";
import { ChatSidebarGroupsRight } from "@/components/chat/chat-sidebar-groups-right";
import { useGroups } from "@/hooks/use-groups";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { Plus, MessageSquare, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudentModal } from "@/components/groups/add-student-modal";
import { AddGroupModal } from "@/components/groups/add-group-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ChatPage() {
    const { groups, loading: groupsLoading } = useGroups();
    const { students } = useStudents();
    const { teachers } = useTeachers();
    const [selectedChat, setSelectedChat] = useState<{ id: string; type: 'group' | 'student' | 'teacher' } | null>(null);
    const [contactTab, setContactTab] = useState<'student' | 'teacher'>('student');

    const activeGroup = selectedChat?.type === 'group' ? groups.find(g => g.id === selectedChat.id) : null;
    const activeStudent = selectedChat?.type === 'student' ? students.find(s => s.id === selectedChat.id) : null;
    const activeTeacher = selectedChat?.type === 'teacher' ? teachers.find(t => t.id === selectedChat.id) : null;

    // Construct a generic "chat subject" for the room
    const chatSubject = activeGroup || activeStudent || activeTeacher;
    return (
        <ModuleGuard module="chat">
            <div className="fixed inset-0 laptop:pl-64 pt-16 bg-[hsl(var(--background))] flex flex-col overflow-hidden">
                {/* --- TOP HEADER (Integrated Polish) --- */}
                <div className="h-20 bg-[hsl(var(--card))]/40 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 shrink-0 relative z-30 shadow-sm">
                    {/* Horizontal Group Chips - Refined Style */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-[60%]">
                        {groups.slice(0, 5).map((group) => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedChat({ id: group.id, type: 'group' })}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border border-border tracking-tight",
                                    selectedChat?.id === group.id
                                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--card))] shadow-lg shadow-primary/20 border-[hsl(var(--primary))]"
                                        : "bg-secondary/50 text-foreground/70 hover:bg-white/10 hover:text-foreground"
                                )}
                            >
                                {group.name.toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        {/* Teachers/Students Toggle - Compact Style */}
                        <div className="flex p-0.5 bg-secondary backdrop-blur-lg rounded-full border border-border shadow-inner">
                            <button
                                onClick={() => setContactTab('teacher')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all",
                                    contactTab === 'teacher' ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/70 hover:text-foreground"
                                )}
                            >
                                преподы
                            </button>
                            <button
                                onClick={() => setContactTab('student')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all",
                                    contactTab === 'student' ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/70 hover:text-foreground"
                                )}
                            >
                                студенты
                            </button>
                        </div>

                        {/* Add Button - Compact Pill */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--card))] text-[11px] font-bold h-8 px-5 rounded-full flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 border-none">
                                    <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                                    добавить
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--secondary))]/95 backdrop-blur-xl border-border text-foreground p-1 rounded-xl shadow-2xl">
                                <DropdownMenuItem className="focus:bg-[hsl(var(--primary))]/20 focus:text-foreground cursor-pointer rounded-lg py-2.5">
                                    <AddStudentModal customTrigger={<span className="font-medium text-[13px]">Добавить ученика</span>} />
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[hsl(var(--primary))]/20 focus:text-foreground cursor-pointer rounded-lg py-2.5">
                                    <AddGroupModal customTrigger={<span className="font-medium text-[13px]">Создать группу</span>} />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* --- MAIN CHAT AREA - More Compact Layout --- */}
                <div className="flex flex-1 overflow-hidden p-3 gap-3 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background))] relative">
                    {/* 1. Chat List (Left Card) */}
                    <div className="w-[300px] laptop:w-[350px] shrink-0 bg-[hsl(var(--card))]/60 backdrop-blur-2xl rounded-[1.5rem] border border-border shadow-2xl overflow-hidden flex flex-col relative z-20">
                        <ChatList
                            selectedId={selectedChat?.id || null}
                            selectedType={selectedChat?.type || null}
                            onSelect={(id: string, type: 'group' | 'student' | 'teacher') => setSelectedChat({ id, type })}
                            activeCategory={contactTab}
                        />
                    </div>

                    {/* 2. Chat Room (Center Card) */}
                    <div className="flex-1 min-w-0 bg-[hsl(var(--background))] rounded-[1.5rem] border border-border shadow-2xl overflow-hidden relative z-10">
                        {selectedChat && chatSubject ? (
                            <ChatRoom
                                selectedGroup={activeGroup || { id: selectedChat.id, name: `${(activeStudent || activeTeacher)?.firstName} ${(activeStudent || activeTeacher)?.lastName}`, code: 'PRIVATE' } as any}
                                allGroups={groups}
                                onGroupSelect={(id) => setSelectedChat({ id, type: 'group' })}
                                onBack={() => setSelectedChat(null)}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[hsl(var(--background))] relative">
                                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/yP/r/UosS85N2v3I.png')] bg-repeat" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary))]/5 via-transparent to-transparent opacity-50" />
                                <div className="relative z-10">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-6 mx-auto shadow-lg border border-border"
                                    >
                                        <MessageSquare className="h-10 w-10 text-foreground/60" />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">Выберите диалог</h2>
                                    <p className="text-[13px] text-[hsl(var(--muted-foreground))] max-w-[280px] mx-auto leading-relaxed">
                                        Начните общение с учениками или коллегами прямо сейчас
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Right Group Switcher (Right Card) */}
                    <div className="relative z-20 h-full flex items-center">
                        <ChatSidebarGroupsRight
                            groups={groups}
                            selectedId={selectedChat?.type === 'group' ? selectedChat.id : null}
                            onSelect={(id) => setSelectedChat({ id, type: 'group' })}
                        />
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
