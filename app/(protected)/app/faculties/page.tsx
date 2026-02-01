'use client';

import { useState, useEffect } from "react";
import { FacultyFilters } from "@/components/faculties/faculty-filters";
import { FacultyCard } from "@/components/faculties/faculty-card";
import { AddFacultyModal } from "@/components/faculties/add-faculty-modal";
import { EditFacultyModal } from "@/components/faculties/edit-faculty-modal";
import { GradientKPICard } from "@/components/shared/gradient-kpi-card";
import { Building2, CheckCircle2, XCircle, Archive, ChevronRight, LayoutGrid } from "lucide-react";
import { Faculty } from "@/lib/types/faculty";
import { ModuleGuard } from "@/components/system/module-guard";
import { motion, AnimatePresence } from "framer-motion";
import { useOrganization } from "@/hooks/use-organization";

export default function FacultiesPage() {
    const { currentOrganizationId } = useOrganization();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (currentOrganizationId) {
            loadFaculties(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    const loadFaculties = (orgId: string) => {
        import("@/lib/data/faculties.repo").then(async ({ facultiesRepo }) => {
            const data = await facultiesRepo.getAll(orgId);
            setFaculties(data);
            setIsLoaded(true);
        });
    };

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

    // Filter Logic
    const filteredFaculties = faculties.filter(f => {
        const matchesSearch =
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.code.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Stats
    const total = faculties.length;
    const active = faculties.filter(s => s.status === 'ACTIVE').length;
    const inactive = faculties.filter(s => s.status === 'INACTIVE').length;
    const archived = faculties.filter(s => s.status === 'ARCHIVED').length;

    const handleEdit = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setEditModalOpen(true);
    };

    const handleSaveUpdate = async (id: string, updates: Partial<Faculty>) => {
        if (!currentOrganizationId) return;
        try {
            const { facultiesRepo } = await import("@/lib/data/faculties.repo");
            const faculty = faculties.find(f => f.id === id);
            if (!faculty) return;
            await facultiesRepo.update(currentOrganizationId, faculty.id, updates);
            setFaculties(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении факультета");
        }
    };

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    return (
        <ModuleGuard module="faculties">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-900" data-help-id="faculties-header">
                    <div className="space-y-1 hidden laptop:block">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            <span>Главная</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>Структура</span>
                            <ChevronRight className="h-3 w-3 text-indigo-500" />
                            <span className="text-zinc-300">Факультеты</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-white">
                                Факультеты
                            </h1>
                        </div>
                        <p className="text-zinc-500 text-sm mt-2">
                            Управление академической структурой и подразделениями университета
                        </p>
                    </div>

                    <div className="flex items-center gap-3" data-help-id="faculties-add-btn">
                        <AddFacultyModal />
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-400 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg">
                            <LayoutGrid className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Gradient Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 laptop:grid-cols-4">
                    <GradientKPICard
                        title="Всего факультетов"
                        value={total}
                        icon={Building2}
                        gradient="bg-gradient-to-br from-indigo-600 to-violet-700"
                        trend="+2 в этом семестре"
                        isUp={true}
                    />
                    <GradientKPICard
                        title="Активные"
                        value={active}
                        icon={CheckCircle2}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    />
                    <GradientKPICard
                        title="Неактивные"
                        value={inactive}
                        icon={XCircle}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    />
                    <GradientKPICard
                        title="Архив"
                        value={archived}
                        icon={Archive}
                        gradient="bg-gradient-to-br from-zinc-700 to-slate-800"
                    />
                </div>

                <div className="space-y-6">
                    {/* Modern Filters */}
                    <div className="bg-zinc-900/30 backdrop-blur-md p-6 rounded-3xl border border-zinc-800/50 shadow-2xl overflow-hidden relative">
                        {/* Decorative glow */}
                        <div className="absolute -left-20 -top-20 h-40 w-40 bg-indigo-500/10 blur-3xl pointer-events-none" />

                        <FacultyFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                        />

                        {/* faculties Grid */}
                        <AnimatePresence mode="popLayout">
                            {filteredFaculties.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-6"
                                    layout
                                >
                                    {filteredFaculties.map((f) => (
                                        <FacultyCard
                                            key={f.id}
                                            faculty={f}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-800"
                                >
                                    <Building2 className="h-16 w-16 mb-4 opacity-10" />
                                    <p className="text-xl font-bold">Факультеты не найдены</p>
                                    <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <EditFacultyModal
                    faculty={selectedFaculty}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSave={handleSaveUpdate}
                />
            </div>
        </ModuleGuard>
    );
}
