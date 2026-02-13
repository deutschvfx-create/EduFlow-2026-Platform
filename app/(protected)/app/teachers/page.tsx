'use client';

import { useState, useMemo, useEffect } from "react";
import { TeacherFilters } from "@/components/teachers/teacher-filters";
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal";
import { Search, Users, Plus, X, Trash2, Mail, Archive, MoreVertical, Info, ShieldCheck, Loader2 } from "lucide-react";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { TeacherCompactCard } from "@/components/teachers/teacher-compact-card";
import { TeacherDetailPanel } from "@/components/teachers/teacher-detail-panel";
import { TeacherPassport } from "@/components/teachers/teacher-passport";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Teacher } from "@/lib/types/teacher";
import { DeleteTeacherModal } from "@/components/teachers/delete-teacher-modal";

export default function TeachersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentOrganizationId } = useOrganization();

    // Responsive check for Drawer
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    useEffect(() => {
        if (!currentOrganizationId) return;

        console.log(`[TeachersPage] Initializing real-time listener for org: ${currentOrganizationId}`);
        setLoading(true);

        let unsubscribe: () => void;

        import("@/lib/data/teachers.repo").then(async ({ teachersRepo }) => {
            try {
                // We need to implement a real-time method in the repo or just use it here
                const { collection, query, where, onSnapshot } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const q = query(
                    collection(db, "users"),
                    where("role", "==", "teacher"),
                    where("organizationId", "==", currentOrganizationId),
                    where("emailVerified", "==", true)
                );

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Teacher[];

                    setTeachers(data);
                    setLoading(false);
                    setError(null);
                }, (err) => {
                    console.error("[TeachersPage] Listener failed:", err);
                    setError("Ошибка синхронизации данных");
                    setLoading(false);
                });
            } catch (err: any) {
                console.error("[TeachersPage] Setup failed:", err);
                setError(err.message);
                setLoading(false);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentOrganizationId]);

    const loadTeachers = (orgId: string) => {
        import("@/lib/data/teachers.repo")
            .then(async ({ teachersRepo }) => {
                try {
                    const data = await teachersRepo.getAll(orgId);
                    console.log(`[TeachersPage] Successfully loaded ${data.length} teachers for org: ${orgId}`);
                    console.log("[TeachersPage] Teacher statuses:", data.map(t => `${t.lastName}: ${t.status}`));
                    setTeachers(data);
                    setError(null);
                } catch (err: any) {
                    console.error("[TeachersPage] Failed to load teachers:", err);
                    setError(err.message || "Ошибка при загрузке");
                } finally {
                    setLoading(false);
                }
            });
    };

    // Multi-select state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isMultiSelecting = selectedIds.size > 0;

    const handleAction = async (action: string, id: string, data?: any) => {
        if (!currentOrganizationId) return;
        try {
            const { teachersRepo } = await import("@/lib/data/teachers.repo");

            if (action === 'update') {
                await teachersRepo.update(currentOrganizationId, id, data);
                setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
            }
            if (action === 'activate') {
                await teachersRepo.update(currentOrganizationId, id, { status: 'ACTIVE' });
                loadTeachers(currentOrganizationId);
            }
            if (action === 'suspend') {
                await teachersRepo.update(currentOrganizationId, id, { status: 'SUSPENDED' });
                loadTeachers(currentOrganizationId);
            }
            if (action === 'archive') {
                await teachersRepo.update(currentOrganizationId, id, { status: 'ARCHIVED' });
                loadTeachers(currentOrganizationId);
            }
            if (action === 'delete') {
                const teacher = teachers.find(t => t.id === id);
                if (teacher) {
                    setTeacherToDelete(teacher);
                    setIsDeleteModalOpen(true);
                }
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
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const matchesSearch =
                teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.email?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
            const matchesRole = roleFilter === 'all' || teacher.role.toLowerCase() === roleFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [teachers, search, statusFilter, roleFilter]);

    const selectedTeacher = useMemo(() =>
        filteredTeachers.find(s => s.id === selectedTeacherId) || null,
        [filteredTeachers, selectedTeacherId]);

    // State for real-time passport preview
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [previewOverrides, setPreviewOverrides] = useState<Partial<any>>({});

    // Reset preview when selection changes
    useEffect(() => {
        setPreviewOverrides({});
    }, [selectedTeacherId]);

    const displayTeacher = useMemo(() => {
        if (!selectedTeacher) return null;
        return { ...selectedTeacher, ...previewOverrides };
    }, [selectedTeacher, previewOverrides]);

    // Stats
    const total = teachers.length;

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
        <ModuleGuard module="teachers">
            <div className="flex h-full overflow-hidden bg-[#F5F6F8]">
                {/* 1. LEFT PANEL: Teacher List (320px Fixed) */}
                <div className={cn(
                    "w-full lg:w-[320px] border-r border-[#E5E7EB] bg-white flex flex-col shrink-0 transition-all duration-300 relative z-30",
                    selectedTeacherId && "hidden lg:flex"
                )}>
                    {/* List Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="min-w-0">
                                <h1 className="text-[18px] font-black text-[#0F172A] tracking-tight font-inter truncate leading-none">Преподаватели</h1>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1 h-1 rounded-full bg-[#0F4C3D]" />
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-inter">
                                        База: {total}
                                    </span>
                                </div>
                            </div>
                            <AddTeacherModal />
                        </div>
                        <TeacherFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            roleFilter={roleFilter}
                            onRoleChange={setRoleFilter}
                        />
                    </div>

                    {/* Teacher List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
                        <div className="flex flex-col gap-1">
                            {filteredTeachers.length === 0 ? (
                                <div className="py-20 text-center text-[#64748B] px-8">
                                    <Search className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                    <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed font-inter">Преподаватели не найдены</p>
                                </div>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <TeacherCompactCard
                                        key={teacher.id}
                                        teacher={teacher}
                                        isSelected={selectedTeacherId === teacher.id}
                                        isMultiSelecting={isMultiSelecting}
                                        isChecked={selectedIds.has(teacher.id)}
                                        onToggleCheck={toggleCheck}
                                        onClick={() => setSelectedTeacherId(teacher.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN & TOP PANELS: Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar relative">

                    {/* 3. TOP PANEL (Sticky ID Card + Actions) */}
                    <TeacherPassport
                        teacher={displayTeacher}
                        onConfirm={displayTeacher && (displayTeacher.status === 'SUSPENDED' || displayTeacher.status === 'INVITED')
                            ? async () => { await handleAction('activate', displayTeacher.id); }
                            : undefined
                        }
                    />


                    {/* Bulk Actions Overlay - Reusing logic if needed, currently placeholder */}
                    {isMultiSelecting && (
                        <div className="absolute top-[170px] left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <X onClick={clearSelection} className="h-4 w-4 cursor-pointer opacity-60 hover:opacity-100" />
                                <span className="text-[14px] font-bold font-inter">Выбрано: {selectedIds.size}</span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-2 text-[12px] font-bold font-inter px-4">
                                    <Mail className="h-3.5 w-3.5" /> Написать
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-2 text-[12px] font-bold font-inter px-4">
                                    <Archive className="h-3.5 w-3.5" /> В архив
                                </Button>
                                <Button size="sm" className="h-8 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-full gap-2 text-[12px] font-black px-6 font-inter">
                                    <Trash2 className="h-3.5 w-3.5" /> Удалить
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 2. CENTRAL PANEL (Working Area) */}
                    <div className="flex-1 flex flex-col items-center bg-transparent p-6 pt-0">
                        <div className="w-full max-w-[1040px] flex-1 flex flex-col min-h-[600px] mt-3">
                            {selectedTeacher ? (
                                <TeacherDetailPanel
                                    teacher={selectedTeacher}
                                    onAction={handleAction}
                                    onPreviewChange={setPreviewOverrides}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-12 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm">
                                    <div className="w-20 h-20 rounded-[20px] bg-[#F5F6F8] flex items-center justify-center mb-6">
                                        <Users className="h-8 w-8 opacity-20" />
                                    </div>
                                    <h2 className="text-[18px] font-black text-[#0F172A] mb-2 tracking-tight font-inter">Выберите преподавателя</h2>
                                    <p className="text-[14px] text-[#64748B] font-medium max-w-[280px] text-center leading-relaxed font-inter">
                                        Выберите запись из списка слева для начала работы с профилем
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Detail Overlay */}
                    {!isLargeScreen && selectedTeacherId && selectedTeacher && (
                        <Sheet open={true} onOpenChange={() => setSelectedTeacherId(null)}>
                            <SheetContent side="right" className="p-0 w-full sm:max-w-[540px] border-l border-[#E5E7EB]">
                                <TeacherDetailPanel
                                    teacher={selectedTeacher}
                                    onAction={handleAction}
                                />
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>

            <DeleteTeacherModal
                teacherName={teacherToDelete ? `${teacherToDelete.firstName} ${teacherToDelete.lastName}` : ""}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={async () => {
                    if (teacherToDelete && currentOrganizationId) {
                        const { teachersRepo } = await import("@/lib/data/teachers.repo");
                        await teachersRepo.delete(currentOrganizationId, teacherToDelete.id);
                        setSelectedTeacherId(null);
                        setTeacherToDelete(null);
                    }
                }}
            />
        </ModuleGuard>
    );
}
