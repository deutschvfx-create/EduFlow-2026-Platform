'use client';

import { useState, useMemo, useEffect } from "react";
import { StudentFilters } from "@/components/students/student-filters";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { Search, Users, Plus, X, Trash2, Mail, Archive, MoreVertical, Info } from "lucide-react";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { useStudents } from "@/hooks/use-students";
import { StudentCompactCard } from "@/components/students/student-compact-card";
import { StudentDetailPanel } from "@/components/students/student-detail-panel";
import { StudentStatsDashboard } from "@/components/students/student-stats-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ActionGuard } from "@/components/auth/action-guard";

import { StudentIDCard } from "@/components/students/student-id-card";

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const { students, loading } = useStudents();
    const { currentOrganizationId } = useOrganization();
    const [error, setError] = useState<string | null>(null);

    // Responsive check for Drawer
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Multi-select state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isMultiSelecting = selectedIds.size > 0;

    const handleAction = async (action: string, id: string) => {
        if (!currentOrganizationId) return;
        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            if (action === 'activate') await studentsRepo.update(currentOrganizationId, id, { status: 'ACTIVE' } as any);
            if (action === 'suspend') await studentsRepo.update(currentOrganizationId, id, { status: 'SUSPENDED' } as any);
            if (action === 'archive') {
                if (confirm("Вы уверены?")) await studentsRepo.update(currentOrganizationId, id, { status: 'ARCHIVED' } as any);
                else return;
            }
        } catch (error) {
            console.error(error);
            alert("Ошибка при выполнении действия");
        }
    };

    const toggleCheck = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(search.toLowerCase()) ||
                student.lastName.toLowerCase().includes(search.toLowerCase()) ||
                student.email?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
            const matchesGroup = groupFilter === 'all' || student.groupIds?.includes(groupFilter);

            return matchesSearch && matchesStatus && matchesGroup;
        });
    }, [students, search, statusFilter, groupFilter]);

    const selectedStudent = useMemo(() =>
        filteredStudents.find(s => s.id === selectedStudentId) || null,
        [filteredStudents, selectedStudentId]);

    // State for real-time passport preview
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [previewOverrides, setPreviewOverrides] = useState<Partial<any>>({});

    // Reset preview when selection changes
    useEffect(() => {
        setPreviewOverrides({});
    }, [selectedStudentId]);

    const displayStudent = useMemo(() => {
        if (!selectedStudent) return null;
        return { ...selectedStudent, ...previewOverrides };
    }, [selectedStudent, previewOverrides]);

    // Stats
    const total = students.length;
    const active = students.filter(s => s.status === 'ACTIVE').length;

    if (loading && !error) {
        return (
            <div className="flex flex-col h-full bg-[#F5F6F8]">
                <div className="flex gap-6 h-full p-6">
                    <div className="w-[320px] flex flex-col gap-4">
                        <Skeleton className="h-[200px] w-full rounded-[12px]" />
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-[68px] w-full rounded-[12px]" />
                        ))}
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                        <Skeleton className="h-[180px] w-full rounded-[12px]" />
                        <Skeleton className="flex-1 w-full rounded-[12px]" />
                    </div>
                </div>
            </div>
        );
    }


    return (
        <ModuleGuard module="students">
            <div className="flex h-full overflow-hidden bg-[#F5F6F8]">
                {/* 1. LEFT PANEL: Student List (320px Fixed) */}
                <div className={cn(
                    "w-full lg:w-[320px] border-r border-[#E5E7EB] bg-white flex flex-col shrink-0 transition-all duration-300 relative z-30",
                    selectedStudentId && "hidden lg:flex"
                )}>
                    {/* List Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="min-w-0">
                                <h1 className="text-[18px] font-black text-[#0F172A] tracking-tight font-inter truncate leading-none">Студенты</h1>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-inter">
                                        База: {total}
                                    </span>
                                </div>
                            </div>
                            <ActionGuard actionLabel="Добавление студентов доступно после регистрации">
                                <AddStudentModal customTrigger={
                                    <Button
                                        size="xs"
                                        className="!h-6 !px-2.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-black text-[9px] uppercase tracking-[0.05em] rounded-full shadow-md shadow-[#2563EB]/20 flex items-center gap-1 transition-all font-inter active:scale-95 shrink-0 border-none"
                                    >
                                        <Plus className="h-2.5 w-2.5" />
                                        <span>Добавить</span>
                                    </Button>
                                } />
                            </ActionGuard>
                        </div>
                        <StudentFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            groupFilter={groupFilter}
                            onGroupChange={setGroupFilter}
                        />
                    </div>

                    {/* Student List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
                        <div className="flex flex-col gap-1">
                            {filteredStudents.length === 0 ? (
                                <div className="py-20 text-center text-[#64748B] px-8">
                                    <Search className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                    <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed font-inter">Студенты не найдены</p>
                                </div>
                            ) : (
                                filteredStudents.map(student => (
                                    <StudentCompactCard
                                        key={student.id}
                                        student={student}
                                        isSelected={selectedStudentId === student.id}
                                        isMultiSelecting={isMultiSelecting}
                                        isChecked={selectedIds.has(student.id)}
                                        onToggleCheck={toggleCheck}
                                        onClick={() => setSelectedStudentId(student.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN & TOP PANELS: Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar relative">

                    {/* 3. TOP PANEL (Sticky ID Card) */}
                    <StudentIDCard
                        student={displayStudent}
                        onAction={handleAction}
                    />

                    {/* Bulk Actions Overlay */}
                    {isMultiSelecting && (
                        <div className="absolute top-[170px] left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <X onClick={clearSelection} className="h-4 w-4 cursor-pointer opacity-60 hover:opacity-100" />
                                <span className="text-[14px] font-bold font-inter">Выбрано: {selectedIds.size}</span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <ActionGuard>
                                    <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-2 text-[12px] font-bold font-inter px-4">
                                        <Mail className="h-3.5 w-3.5" /> Написать
                                    </Button>
                                </ActionGuard>
                                <ActionGuard>
                                    <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-2 text-[12px] font-bold font-inter px-4">
                                        <Archive className="h-3.5 w-3.5" /> В архив
                                    </Button>
                                </ActionGuard>
                                <ActionGuard actionLabel="Удаление доступно только владельцам">
                                    <Button size="sm" className="h-8 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-full gap-2 text-[12px] font-black px-6 font-inter">
                                        <Trash2 className="h-3.5 w-3.5" /> Удалить
                                    </Button>
                                </ActionGuard>
                            </div>
                        </div>
                    )}

                    {/* 2. CENTRAL PANEL (Working Area) */}
                    <div className="flex-1 flex flex-col items-center bg-transparent p-6 pt-0">
                        <div className="w-full max-w-[1040px] flex-1 flex flex-col min-h-[600px] mt-3">
                            {selectedStudent ? (
                                <StudentDetailPanel
                                    student={selectedStudent}
                                    onAction={handleAction}
                                    onClose={isLargeScreen ? undefined : () => setSelectedStudentId(null)}
                                    onPreviewChange={setPreviewOverrides}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-12 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm">
                                    <div className="w-20 h-20 rounded-[20px] bg-[#F5F6F8] flex items-center justify-center mb-6">
                                        <Users className="h-8 w-8 opacity-20" />
                                    </div>
                                    <h2 className="text-[18px] font-black text-[#0F172A] mb-2 tracking-tight font-inter">Выберите студента</h2>
                                    <p className="text-[14px] text-[#64748B] font-medium max-w-[280px] text-center leading-relaxed font-inter">
                                        Выберите запись из списка слева для начала работы с профилем
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Detail Overlay */}
                    {!isLargeScreen && selectedStudentId && (
                        <Sheet open={true} onOpenChange={() => setSelectedStudentId(null)}>
                            <SheetContent side="right" className="p-0 w-full sm:max-w-[540px] border-l border-[#E5E7EB]">
                                <StudentDetailPanel
                                    student={selectedStudent}
                                    onAction={handleAction}
                                    onClose={() => setSelectedStudentId(null)}
                                    onPreviewChange={setPreviewOverrides}
                                />
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </ModuleGuard>
    );
}
