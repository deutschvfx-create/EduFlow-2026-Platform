'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { GroupFilters } from "@/components/groups/group-filters";
import { GroupsTable } from "@/components/groups/groups-table";
import { AddGroupModal } from "@/components/groups/add-group-modal";
import { EditGroupModal } from "@/components/groups/edit-group-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, CheckCircle2, XCircle, Archive } from "lucide-react";
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
    const { currentOrganizationId } = useOrganization();

    useEffect(() => {
        if (!currentOrganizationId) return;
        import("@/lib/data/groups.repo").then(async ({ groupsRepo }) => {
            const data = await groupsRepo.getAll(currentOrganizationId);
            setGroups(data as any);
            setIsLoaded(true);
        });
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

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

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
            await groupsRepo.update(currentOrganizationId, { ...group, ...updates });
            setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении группы");
        }
    };

    return (
        <ModuleGuard module="groups">
            <div className="space-y-6">
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
