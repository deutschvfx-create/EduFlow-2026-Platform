'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { CourseFilters } from "@/components/courses/course-filters";
// import { CoursesTable } from "@/components/courses/courses-table"; // Removed
import { CourseListPanel } from "@/components/courses/course-list-panel";
import { CourseDetailPanel } from "@/components/courses/course-detail-panel";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { EditCourseModal } from "@/components/courses/edit-course-modal";
import { AssignTeachersModal } from "@/components/courses/assign-teachers-modal";
import { LinkGroupsModal } from "@/components/courses/link-groups-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, XCircle, Archive, AlertCircle, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Course } from "@/lib/types/course";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // Filter Logic
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { currentOrganizationId } = useOrganization();

    const loadCourses = (orgId: string) => {
        setIsLoaded(false);
        setError(null);
        import("@/lib/data/courses.repo").then(async ({ coursesRepo }) => {
            try {
                const data = await coursesRepo.getAll(orgId);
                setCourses(data as any);
                setIsLoaded(true);
            } catch (err: any) {
                console.error("Courses load error:", err);
                setError(err.message || "Не удалось загрузить курсы");
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
            loadCourses(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    // Filter Logic
    const filteredCourses = courses.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesFaculty = facultyFilter === 'all' || c.facultyId === facultyFilter;
        const matchesDepartment = departmentFilter === 'all' || c.departmentId === departmentFilter;
        const matchesTeacher = teacherFilter === 'all' || c.teacherIds.includes(teacherFilter);

        return matchesSearch && matchesStatus && matchesFaculty && matchesDepartment && matchesTeacher;
    });

    const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;

    // Stats
    const total = courses.length;
    const active = courses.filter(s => s.status === 'ACTIVE').length;
    const inactive = courses.filter(s => s.status === 'INACTIVE').length;
    const archived = courses.filter(s => s.status === 'ARCHIVED').length;

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-muted-foreground">
            <div className="h-10 w-10 border-2 border-primary/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Загрузка курсов...</p>
        </div>
    );

    const handleSaveUpdate = async (id: string, updates: Partial<Course>) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            const course = courses.find(c => c.id === id);
            if (!course) return;
            await coursesRepo.update(currentOrganizationId, course.id, updates);
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении курса");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
            if (selectedCourseId === id) {
                setSelectedCourseId(null);
            }
        } catch (e) {
            console.error("Failed to delete course:", e);
        }
    };

    return (
        <ModuleGuard module="courses">
            <div className="flex h-full overflow-hidden bg-[#F5F6F8]">
                {/* 1. LEFT PANEL: Course List (320px Fixed) */}
                <div className={cn(
                    "w-full lg:w-[320px] border-r border-[#E5E7EB] bg-white flex flex-col shrink-0 transition-all duration-300 relative z-30",
                    selectedCourseId && "hidden lg:flex"
                )}>
                    {/* List Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="min-w-0">
                                <h1 className="text-[18px] font-black text-[#0F172A] tracking-tight font-inter truncate leading-none">Курсы</h1>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-inter">
                                        Всего: {total}
                                    </span>
                                </div>
                            </div>
                            <AddCourseModal onSuccess={(newCourse) => {
                                setCourses(prev => [newCourse, ...prev]);
                                setSelectedCourseId(newCourse.id);
                            }} />
                        </div>
                        <CourseFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            facultyFilter={facultyFilter}
                            onFacultyChange={setFacultyFilter}
                            departmentFilter={departmentFilter}
                            onDepartmentChange={setDepartmentFilter}
                            teacherFilter={teacherFilter}
                            onTeacherChange={setTeacherFilter}
                        />
                    </div>

                    {/* Course List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
                        <div className="flex flex-col gap-1">
                            <CourseListPanel
                                courses={filteredCourses}
                                selectedCourseId={selectedCourseId}
                                onSelect={(c) => setSelectedCourseId(c.id)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. MAIN & TOP PANELS: Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                    {/* 4. CENTER PANEL (Working Area) */}
                    <div className="flex-1 flex flex-col items-center bg-transparent p-6">
                        <div className="w-full max-w-[1040px] flex-1 flex flex-col min-h-[600px]">
                            {selectedCourse ? (
                                <CourseDetailPanel
                                    course={selectedCourse}
                                    onUpdate={handleSaveUpdate}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-12 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm">
                                    <div className="w-20 h-20 rounded-[20px] bg-[#F5F6F8] flex items-center justify-center mb-6">
                                        <BookOpen className="h-8 w-8 opacity-20" />
                                    </div>
                                    <h2 className="text-[18px] font-black text-[#0F172A] mb-2 tracking-tight font-inter">Выберите курс</h2>
                                    <p className="text-[14px] text-[#64748B] font-medium max-w-[280px] text-center leading-relaxed font-inter">
                                        Выберите курс из списка слева для просмотра деталей и редактирования
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
