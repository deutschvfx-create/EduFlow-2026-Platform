'use client';

import { useState, useEffect } from "react";
// import { MOCK_FACULTIES } from "@/lib/mock/faculties";
import { FacultyFilters } from "@/components/faculties/faculty-filters";
import { FacultiesTable } from "@/components/faculties/faculties-table";
import { AddFacultyModal } from "@/components/faculties/add-faculty-modal";
import { EditFacultyModal } from "@/components/faculties/edit-faculty-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, XCircle, Archive } from "lucide-react";
import { Faculty } from "@/lib/types/faculty";
import { ModuleGuard } from "@/components/system/module-guard";

export default function FacultiesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = () => {
        import("@/lib/data/faculties.repo").then(async ({ facultiesRepo }) => {
            const data = await facultiesRepo.getAll();
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

    const handleSaveUpdate = (id: string, updates: Partial<Faculty>) => {
        // Mock save logic
        alert(`Факультет ${updates.code} обновлен`);
    };

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    return (
        <ModuleGuard module="faculties">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Факультеты</h1>
                        <p className="text-zinc-400">Управление структурой университета</p>
                    </div>
                    <div className="flex gap-2" data-help-id="faculties-add-btn">
                        <AddFacultyModal />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего факультетов</CardTitle>
                            <Building2 className="h-4 w-4 text-zinc-500" />
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
                    <FacultyFilters
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    <FacultiesTable
                        faculties={filteredFaculties}
                        onEdit={handleEdit}
                    />
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
