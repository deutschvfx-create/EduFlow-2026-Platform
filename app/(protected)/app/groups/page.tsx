'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { GroupFilters } from "@/components/groups/group-filters";
import { GroupsTable } from "@/components/groups/groups-table";
import { AddGroupModal } from "@/components/groups/add-group-modal";
import { EditGroupModal } from "@/components/groups/edit-group-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, CheckCircle2, XCircle, Archive, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Group } from "@/lib/types/group";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { groupsRepo } from "@/lib/data/groups.repo";

export default function GroupsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Filter Logic
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { currentOrganizationId } = useOrganization();

    const loadGroups = (orgId: string) => {
        setIsLoaded(false);
        setError(null);
        import("@/lib/data/groups.repo").then(async ({ groupsRepo }) => {
            try {
                const data = await groupsRepo.getAll(orgId);
                setGroups(data as any);
                setIsLoaded(true);
            } catch (err: any) {
                console.error("Groups load error:", err);
                setError(err.message || "Не удалось загрузить группы");
                setIsLoaded(true);
            }
        }).catch(err => {
            console.error("Repo import error:", err);
            setError("Ошибка загрузки модуля");
            setIsLoaded(true);
        });
    };

    useEffect(() => {
        if (currentOrganizationId) {
            loadGroups(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    // Filter Logic
    // Filter Logic
    const filteredGroups = groups.filter(g => {
        const matchesSearch =
            g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.code.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
        const matchesFaculty = facultyFilter === 'all' || g.facultyId === facultyFilter;
        const matchesDepartment = departmentFilter === 'all' || g.departmentId === departmentFilter;

        return matchesSearch && matchesStatus && matchesFaculty && matchesDepartment;
    });

    // Stats
    const total = groups.length;
    const active = groups.filter(s => s.status === 'ACTIVE').length;
    const inactive = groups.filter(s => s.status === 'INACTIVE').length;
    const archived = groups.filter(s => s.status === 'ARCHIVED').length;

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-zinc-500">
            <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Загрузка групп...</p>
        </div>
    );

    const handleEdit = (group: Group) => {
        setSelectedGroup(group);
        setEditModalOpen(true);
    };

    const handleSaveUpdate = async (id: string, updates: Partial<Group>) => {
        if (!currentOrganizationId) return;
        try {
            const { groupsRepo } = await import("@/lib/data/groups.repo");
            const group = groups.find(g => g.id === id);
            if (!group) return;
            await groupsRepo.update(currentOrganizationId, group.id, updates);
            setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении группы");
        }
    };

    return (
        <ModuleGuard module="groups">
            <div className="space-y-6">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex gap-4"
                        >
                            <AlertCircle className="h-6 w-6 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-black uppercase tracking-tight text-lg leading-tight">Ошибка загрузки</h3>
                                <p className="text-sm font-bold opacity-80 mt-1">
                                    {error}. Проверьте соединение или права доступа.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadGroups(currentOrganizationId!)}
                                    className="mt-4 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl px-6"
                                >
                                    <RefreshCcw className="mr-2 h-3 w-3" /> Попробовать снова
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-help-id="groups-header">
                    <div className="hidden laptop:block">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Группы</h1>
                        <p className="text-zinc-400">Управление потоками, студентами и преподавателями</p>
                    </div>
                    <div className="flex gap-2" data-help-id="groups-create-btn">
                        <AddGroupModal />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего групп</CardTitle>
                            <Layers className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Активные</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Неактивные</CardTitle>
                            <XCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{inactive}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Архив</CardTitle>
                            <Archive className="h-4 w-4 text-zinc-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-500">{archived}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-zinc-950/50 p-1">
                    <GroupFilters
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        facultyFilter={facultyFilter}
                        onFacultyChange={setFacultyFilter}
                        departmentFilter={departmentFilter}
                        onDepartmentChange={setDepartmentFilter}
                    />

                    <GroupsTable
                        groups={filteredGroups}
                        onEdit={handleEdit}
                    />
                </div>

                <EditGroupModal
                    group={selectedGroup}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSave={handleSaveUpdate}
                />
            </div>
        </ModuleGuard>
    );
}
