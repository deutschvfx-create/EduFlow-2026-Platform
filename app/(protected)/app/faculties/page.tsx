'use client';

import { useState, useEffect } from "react";
import { FacultyFilters } from "@/components/faculties/faculty-filters";
import { FacultyCard } from "@/components/faculties/faculty-card";
import { AddFacultyModal } from "@/components/faculties/add-faculty-modal";
import { EditFacultyModal } from "@/components/faculties/edit-faculty-modal";
import { GradientKPICard } from "@/components/shared/gradient-kpi-card";
import { Building2, CheckCircle2, XCircle, Archive, ChevronRight, LayoutGrid, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Faculty } from "@/lib/types/faculty";
import { ModuleGuard } from "@/components/system/module-guard";
import { motion, AnimatePresence } from "framer-motion";
import { useOrganization } from "@/hooks/use-organization";
import { ActionGuard } from "@/components/auth/action-guard";

export default function FacultiesPage() {
    const { currentOrganizationId } = useOrganization();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentOrganizationId) {
            loadFaculties(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    const loadFaculties = (orgId: string) => {
        setIsLoaded(false);
        setError(null);
        import("@/lib/data/faculties.repo").then(async ({ facultiesRepo }) => {
            try {
                const data = await facultiesRepo.getAll(orgId);
                setFaculties(data);
                setIsLoaded(true);
            } catch (err: any) {
                console.error("Faculties load error:", err);
                setError(err.message || "Не удалось загрузить данные");
                setIsLoaded(true);
            }
        }).catch(err => {
            console.error("Repo import error:", err);
            setError("Ошибка загрузки модуля");
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
            // In a real app we'd use a toast here
        }
    };

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="h-12 w-12 rounded-2xl border-2 border-primary/20 border-t-cyan-500 animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Загрузка факультетов...</p>
        </div>
    );

    return (
        <ModuleGuard module="faculties">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
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
                                    onClick={() => loadFaculties(currentOrganizationId!)}
                                    className="mt-4 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl px-6"
                                >
                                    <RefreshCcw className="mr-2 h-3 w-3" /> Попробовать снова
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border" data-help-id="faculties-header">
                    <div className="space-y-1 hidden laptop:block">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                            <span>Главная</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>Структура</span>
                            <ChevronRight className="h-3 w-3 text-primary" />
                            <span className="text-foreground/80">Факультеты</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Building2 className="h-5 w-5 text-foreground" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Факультеты
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-sm mt-2">
                            Управление академической структурой и подразделениями университета
                        </p>
                    </div>

                    <div className="flex items-center gap-3" data-help-id="faculties-add-btn">
                        <ActionGuard actionLabel="Чтобы создать факультет, нужно зарегистрироваться">
                            <AddFacultyModal />
                        </ActionGuard>
                        <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg">
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
                        gradient="bg-gradient-to-br from-cyan-600 to-blue-700"
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
                    <div className="bg-card/30 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-2xl overflow-hidden relative">
                        {/* Decorative glow */}
                        <div className="absolute -left-20 -top-20 h-40 w-40 bg-primary/10 blur-3xl pointer-events-none" />

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
                                    className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-background/20 rounded-2xl border border-dashed border-border"
                                >
                                    <Building2 className="h-16 w-16 mb-4 opacity-40" />
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
