'use client';

import { useState, useMemo, useEffect } from "react";
import { CompactGroupCard } from "@/components/groups/compact-group-card";
import { GroupDetailPanel } from "@/components/groups/group-detail-panel";
import { AddGroupModal } from "@/components/groups/add-group-modal";
import { DeleteGroupModal } from "@/components/groups/delete-group-modal";
import { ArchiveGroupModal } from "@/components/groups/archive-group-modal";
import { Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Group } from "@/lib/types/group";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { useGroups } from "@/hooks/use-groups";
import { useTeachers } from "@/hooks/use-teachers";
import { useFaculties } from "@/hooks/use-faculties";
import { useModules } from "@/hooks/use-modules";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ActionGuard } from "@/components/auth/action-guard";

export default function GroupsPage() {
    const { groups, loading } = useGroups();
    const { teachers } = useTeachers();
    const { faculties } = useFaculties();
    const { modules } = useModules();
    const { currentOrganizationId } = useOrganization();

    const [search, setSearch] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [facultyFilter, setFacultyFilter] = useState<string>("all");
    const [teacherFilter, setTeacherFilter] = useState<string>("all");

    // Modal States
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

    // Filter Logic
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const matchesSearch =
                g.name.toLowerCase().includes(search.toLowerCase()) ||
                g.code.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || g.status === statusFilter;
            const matchesFaculty = facultyFilter === "all" || g.facultyId === facultyFilter;
            const matchesTeacher = teacherFilter === "all" || g.curatorTeacherId === teacherFilter;
            return matchesSearch && matchesStatus && matchesFaculty && matchesTeacher;
        });
    }, [groups, search, statusFilter, facultyFilter, teacherFilter]);

    // Active Group for Right Panel
    const activeGroup = useMemo(() => {
        if (selectedGroupId) return groups.find(g => g.id === selectedGroupId);
        if (filteredGroups.length > 0) return filteredGroups[0];
        return null;
    }, [selectedGroupId, filteredGroups, groups]);

    const handleSaveUpdate = async (id: string, updates: Partial<Group>) => {
        if (!currentOrganizationId) return;
        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            await groupsRepo.update(currentOrganizationId, id, updates);
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении группы");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentOrganizationId) return;
        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            await groupsRepo.delete(currentOrganizationId, id);
            setSelectedGroupId(null);
            setGroupToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при удалении группы");
        }
    };

    const handleArchive = async (id: string, reason: string, notes?: string) => {
        if (!currentOrganizationId) return;
        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            await groupsRepo.update(currentOrganizationId, id, {
                status: 'ARCHIVED'
            });
            setIsArchiveModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Ошибка при архивации группы");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-muted-foreground">
            <div className="h-10 w-10 border-2 border-primary/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Загрузка групп...</p>
        </div>
    );

    return (
        <ModuleGuard module="groups">
            <div className="flex h-full overflow-hidden bg-[#F5F6F8]">
                {/* 1. LEFT PANEL: Group List (320px Fixed) */}
                <div className={cn(
                    "w-full lg:w-[320px] border-r border-[#E5E7EB] bg-white flex flex-col shrink-0 transition-all duration-300 relative z-30",
                    selectedGroupId && "hidden lg:flex"
                )}>
                    {/* List Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="min-w-0">
                                <h1 className="text-[18px] font-black text-[#0F172A] tracking-tight font-inter truncate leading-none">Группы</h1>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-inter">
                                        Всего: {groups.length}
                                    </span>
                                </div>
                            </div>
                            <ActionGuard actionLabel="Чтобы создать группу, нужно зарегистрироваться">
                                <AddGroupModal onSuccess={(newId) => setSelectedGroupId(newId)} />
                            </ActionGuard>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] group-focus-within:text-[#2563EB] transition-colors" />
                            <Input
                                placeholder="Поиск по названию или коду..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 pl-11 bg-[#F1F5F9] border-transparent text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] rounded-full focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter shadow-none"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#2563EB]/5 hover:bg-[#F8FAFC] hover:border-[#2563EB]/30 transition-all font-inter px-3.5 shadow-sm">
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                                    <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ СТАТУСЫ</SelectItem>
                                    <SelectItem value="ACTIVE" className="text-[10px] font-bold py-2 text-[#22C55E] rounded-full font-inter uppercase tracking-wider">АКТИВНЫЕ</SelectItem>
                                    <SelectItem value="INACTIVE" className="text-[10px] font-bold py-2 text-[#64748B] rounded-full font-inter uppercase tracking-wider">НЕАКТИВНЫЕ</SelectItem>
                                    <SelectItem value="ARCHIVED" className="text-[10px] font-bold py-2 text-[#EF4444] rounded-full font-inter uppercase tracking-wider">АРХИВ</SelectItem>
                                </SelectContent>
                            </Select>

                            {modules.faculties && (
                                <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                                    <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#2563EB]/5 hover:bg-[#F8FAFC] hover:border-[#2563EB]/30 transition-all font-inter px-3.5 shadow-sm">
                                        <SelectValue placeholder="Факультет" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1">
                                        <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ ФАКУЛЬТЕТЫ</SelectItem>
                                        {faculties.map(f => (
                                            <SelectItem key={f.id} value={f.id} className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                                <SelectTrigger className="flex-1 min-w-[120px] h-8 bg-white border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider rounded-full focus:ring-4 focus:ring-[#2563EB]/5 hover:bg-[#F8FAFC] hover:border-[#2563EB]/30 transition-all font-inter px-3.5 shadow-sm">
                                    <SelectValue placeholder="Куратор" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[12px] border-[#E2E8F0] shadow-2xl p-1">
                                    <SelectItem value="all" className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">ВСЕ КУРАТОРЫ</SelectItem>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id} className="text-[10px] font-bold py-2 rounded-full font-inter uppercase tracking-wider">{t.firstName} {t.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Group List */}
                <ScrollArea className="flex-1 px-3 pb-6">
                    <div className="flex flex-col gap-1">
                        <AnimatePresence mode="popLayout">
                            {filteredGroups.map((group) => (
                                <CompactGroupCard
                                    key={group.id}
                                    group={group}
                                    isActive={selectedGroupId === group.id || (!selectedGroupId && activeGroup?.id === group.id)}
                                    onClick={() => setSelectedGroupId(group.id)}
                                />
                            ))}
                        </AnimatePresence>
                        {filteredGroups.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest opacity-60">Группы не найдены</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="flex-1 flex flex-col items-center bg-transparent p-6 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-[1040px] flex-1 flex flex-col min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {activeGroup ? (
                                <motion.div
                                    key={activeGroup.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 flex flex-col min-h-0"
                                >
                                    <GroupDetailPanel
                                        group={activeGroup}
                                        onUpdate={handleSaveUpdate}
                                        onDelete={(id) => {
                                            setGroupToDelete(activeGroup);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        onArchive={() => setIsArchiveModalOpen(true)}
                                    />
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-12 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm">
                                    <div className="w-20 h-20 rounded-[20px] bg-[#F5F6F8] flex items-center justify-center mb-6">
                                        <Layers className="h-8 w-8 opacity-20" />
                                    </div>
                                    <h2 className="text-[18px] font-black text-[#0F172A] mb-2 tracking-tight font-inter">Выберите группу</h2>
                                    <p className="text-[14px] text-[#64748B] font-medium max-w-[280px] text-center leading-relaxed font-inter">
                                        Выберите группу из списка слева для просмотра состава и редактирования информации
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DeleteGroupModal
                groupName={groupToDelete?.name || ""}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={() => groupToDelete ? handleDelete(groupToDelete.id) : Promise.resolve()}
            />

            <ArchiveGroupModal
                group={activeGroup || null}
                open={isArchiveModalOpen}
                onOpenChange={setIsArchiveModalOpen}
                onArchive={handleArchive}
            />
        </div>
        </ModuleGuard>
    );
}
