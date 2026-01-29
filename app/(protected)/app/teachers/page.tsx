'use client';

import { useState, useEffect } from "react";
// import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { TeacherFilters } from "@/components/teachers/teacher-filters";
import { TeachersTable } from "@/components/teachers/teachers-table";
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal";
import { EditPermissionsModal } from "@/components/teachers/permissions-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Teacher, TeacherPermissions } from "@/lib/types/teacher";
import { ModuleGuard } from "@/components/system/module-guard";

import { TeacherGrid } from "@/components/teachers/teacher-grid";
import { LayoutGrid, List, ShieldCheck } from "lucide-react";
import { TeacherControlToolbar } from "@/components/teachers/teacher-control-toolbar";
import { Badge } from "@/components/ui/badge";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TeachersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

    // Control Mode State
    const [controlMode, setControlMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [problemFilter, setProblemFilter] = useState<"all" | "no_groups" | "invited" | "suspended">("all");

    // Permissions Modal State
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // Filter Logic
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Roadmap Dialog State
    const [assignmentRoadmapOpen, setAssignmentRoadmapOpen] = useState(false);

    useEffect(() => {
        // Load preference
        const savedView = localStorage.getItem("teachers-view-preference") as "table" | "grid";
        if (savedView) setViewMode(savedView);

        const savedControl = localStorage.getItem("teachers-control-mode") === "true";
        setControlMode(savedControl);

        loadTeachers();
    }, []);

    const loadTeachers = () => {
        import("@/lib/data/teachers.repo").then(async ({ teachersRepo }) => {
            const data = await teachersRepo.getAll();
            setTeachers(data);
            setIsLoaded(true);
        });
    };

    const toggleView = (mode: "table" | "grid") => {
        setViewMode(mode);
        localStorage.setItem("teachers-view-preference", mode);
    };

    const toggleControlMode = () => {
        const newValue = !controlMode;
        setControlMode(newValue);
        localStorage.setItem("teachers-control-mode", String(newValue));
        if (!newValue) {
            setSelectedIds([]); // Clear selection when exiting
            setProblemFilter("all");
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action: string) => {
        const { teachersRepo } = await import("@/lib/data/teachers.repo");

        if (action === 'delete') {
            if (!confirm(`Удалить ${selectedIds.length} преподавателей?`)) return;
            selectedIds.forEach(id => teachersRepo.delete(id));
        } else if (action === 'suspend') {
            selectedIds.forEach(id => teachersRepo.update(id, { status: 'SUSPENDED' }));
        } else if (action === 'activate') {
            selectedIds.forEach(id => teachersRepo.update(id, { status: 'ACTIVE' }));
        } else if (action === 'assign_groups') {
            setAssignmentRoadmapOpen(true);
            return;
        }

        loadTeachers();
        setSelectedIds([]);
    };

    // Filter Logic
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch =
            teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
            teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
            teacher.specialization?.toLowerCase().includes(search.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
        const matchesRole = roleFilter === 'all' || teacher.role === roleFilter;
        const matchesGroup = groupFilter === 'all' || teacher.groups?.some(g => g.id === groupFilter);

        // Problem Filter (Only in Control Mode)
        let matchesProblem = true;
        if (controlMode && problemFilter !== 'all') {
            if (problemFilter === 'no_groups') matchesProblem = (!teacher.groups || teacher.groups.length === 0);
            if (problemFilter === 'invited') matchesProblem = teacher.status === 'INVITED';
            if (problemFilter === 'suspended') matchesProblem = teacher.status === 'SUSPENDED';
        }

        return matchesSearch && matchesStatus && matchesRole && matchesGroup && matchesProblem;
    });

    // Stats
    const total = teachers.length;
    const active = teachers.filter(s => s.status === 'ACTIVE').length;
    const invited = teachers.filter(s => s.status === 'INVITED').length;
    const suspended = teachers.filter(s => s.status === 'SUSPENDED').length;
    const noGroups = teachers.filter(s => !s.groups || s.groups.length === 0).length;

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    const handleEditPermissions = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setPermissionsModalOpen(true);
    };

    const handleSavePermissions = (teacherId: string, newPermissions: TeacherPermissions) => {
        // Mock save logic
        alert(`Permissions updated for teacher ${teacherId}`);
        // In real app, we would update state or call API
    };

    return (
        <ModuleGuard module="teachers">
            {/* Assignment Roadmap Dialog */}
            <Dialog open={assignmentRoadmapOpen} onOpenChange={setAssignmentRoadmapOpen}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 p-0 overflow-hidden">
                    <FeaturePlaceholder
                        featureName="Массовое Назначение Групп"
                        plannedFeatures={[
                            "Выбор нескольких групп для группы преподавателей",
                            "Копирование расписания между учителями",
                            "Автоматический расчет нагрузки при назначении",
                            "Интеллектуальный поиск конфликтов в расписании",
                            "Экспорт обновленного графика штата в PDF"
                        ]}
                        benefits={[
                            "Экономия времени при формировании семестра",
                            "Прозрачное распределение нагрузки",
                            "Мгновенное уведомление учителей о новых группах"
                        ]}
                    />
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="hidden laptop:block">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                            Преподаватели
                            {controlMode && <Badge className="ml-3 bg-indigo-500 text-white border-none">Control Mode</Badge>}
                        </h1>
                        <p className="text-zinc-400">Управление штатом и правами доступа</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Control Mode Toggle */}
                        <Button
                            variant={controlMode ? "default" : "outline"}
                            size="sm"
                            onClick={toggleControlMode}
                            className={`mr-2 gap-2 ${controlMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {controlMode ? "Контроль" : "Обычный"}
                        </Button>

                        <div className="bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 flex items-center mr-2">
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={`h-8 px-2 ${viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                onClick={() => toggleView('table')}
                            >
                                <List className="h-4 w-4 mr-1" />
                                Таблица
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={`h-8 px-2 ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                onClick={() => toggleView('grid')}
                            >
                                <LayoutGrid className="h-4 w-4 mr-1" />
                                Карточки
                            </Button>
                        </div>

                        <Button variant="outline" className="gap-2 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800" data-help-id="teachers-invite-btn">
                            Пригласить
                        </Button>
                        <AddTeacherModal />
                    </div>
                </div>

                {/* Stats Cards (Hidden in Control Mode for compactness, or keep?) - keeping for now */}
                {!controlMode && (
                    <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Всего преподавателей</CardTitle>
                                <GraduationCap className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{total}</div>
                            </CardContent>
                        </Card>
                        {/* More stats... simplified for brevity in this update, keeping original logic if preferred or hiding in control mode */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-400">Активные</CardTitle>
                                <Users className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{active}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-400">Ожидают</CardTitle>
                                <Clock className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{invited}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-400">Заблокированы</CardTitle>
                                <UserX className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{suspended}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Control Mode Quick Filters */}
                {controlMode && (
                    <div className="flex gap-2 pb-2 overflow-x-auto">
                        <Badge
                            variant={problemFilter === 'all' ? 'default' : 'outline'}
                            className={`cursor-pointer ${problemFilter === 'all' ? 'bg-zinc-800' : 'border-zinc-700 text-zinc-400'}`}
                            onClick={() => setProblemFilter('all')}
                        >
                            Все
                        </Badge>
                        <Badge
                            variant={problemFilter === 'no_groups' ? 'default' : 'outline'}
                            className={`cursor-pointer ${problemFilter === 'no_groups' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-zinc-700 text-zinc-400'}`}
                            onClick={() => setProblemFilter('no_groups')}
                        >
                            Без групп ({noGroups})
                        </Badge>
                        <Badge
                            variant={problemFilter === 'invited' ? 'default' : 'outline'}
                            className={`cursor-pointer ${problemFilter === 'invited' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'border-zinc-700 text-zinc-400'}`}
                            onClick={() => setProblemFilter('invited')}
                        >
                            Ожидают ({invited})
                        </Badge>
                        <Badge
                            variant={problemFilter === 'suspended' ? 'default' : 'outline'}
                            className={`cursor-pointer ${problemFilter === 'suspended' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'border-zinc-700 text-zinc-400'}`}
                            onClick={() => setProblemFilter('suspended')}
                        >
                            Заблокированы ({suspended})
                        </Badge>
                    </div>
                )}

                <div className="bg-zinc-950/50 p-1">
                    {!controlMode && (
                        <TeacherFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            roleFilter={roleFilter}
                            onRoleChange={setRoleFilter}
                            groupFilter={groupFilter}
                            onGroupChange={setGroupFilter}
                        />
                    )}

                    {viewMode === 'table' ? (
                        <TeachersTable
                            teachers={filteredTeachers}
                            onEditPermissions={handleEditPermissions}
                        />
                    ) : (
                        <TeacherGrid
                            teachers={filteredTeachers}
                            onEditPermissions={handleEditPermissions}
                            controlMode={controlMode}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelection}
                        />
                    )}
                </div>

                <TeacherControlToolbar
                    selectedCount={selectedIds.length}
                    onClearSelection={() => setSelectedIds([])}
                    onBulkAction={handleBulkAction}
                />

                <EditPermissionsModal
                    teacher={selectedTeacher}
                    open={permissionsModalOpen}
                    onOpenChange={setPermissionsModalOpen}
                    onSave={handleSavePermissions}
                />
            </div>
        </ModuleGuard>
    );
}
