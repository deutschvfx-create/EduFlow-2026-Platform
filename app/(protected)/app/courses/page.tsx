'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { CourseFilters } from "@/components/courses/course-filters";
import { CoursesTable } from "@/components/courses/courses-table";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { EditCourseModal } from "@/components/courses/edit-course-modal";
import { AssignTeachersModal } from "@/components/courses/assign-teachers-modal";
import { LinkGroupsModal } from "@/components/courses/link-groups-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, XCircle, Archive, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Course } from "@/lib/types/course";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { coursesRepo } from "@/lib/data/courses.repo";

export default function CoursesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");

    // Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignTeachersOpen, setAssignTeachersOpen] = useState(false);
    const [linkGroupsOpen, setLinkGroupsOpen] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
                setError(err.message || "Не удалось загрузить предметы");
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

    // Stats
    const total = courses.length;
    const active = courses.filter(s => s.status === 'ACTIVE').length;
    const inactive = courses.filter(s => s.status === 'INACTIVE').length;
    const archived = courses.filter(s => s.status === 'ARCHIVED').length;

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-zinc-500">
            <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Загрузка предметов...</p>
        </div>
    );

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setEditModalOpen(true);
    };

    const handleAssignTeachers = (course: Course) => {
        setSelectedCourse(course);
        setAssignTeachersOpen(true);
    };

    const handleLinkGroups = (course: Course) => {
        setSelectedCourse(course);
        setLinkGroupsOpen(true);
    };

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
            alert("Ошибка при обновлении предмета");
        }
    };

    const handleSaveTeachers = async (id: string, teacherIds: string[]) => {
        await handleSaveUpdate(id, { teacherIds });
    };

    const handleSaveGroups = async (id: string, groupIds: string[]) => {
        await handleSaveUpdate(id, { groupIds });
    };

    return (
        <ModuleGuard module="courses">
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
                                    onClick={() => loadCourses(currentOrganizationId!)}
                                    className="mt-4 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl px-6"
                                >
                                    <RefreshCcw className="mr-2 h-3 w-3" /> Попробовать снова
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="hidden laptop:block">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Предметы</h1>
                        <p className="text-zinc-400">Управление учебными дисциплинами и назначениями</p>
                    </div>
                    <div className="flex gap-2">
                        <AddCourseModal />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего предметов</CardTitle>
                            <BookOpen className="h-4 w-4 text-zinc-500" />
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

                    <CoursesTable
                        courses={filteredCourses}
                        onEdit={handleEdit}
                        onAssignTeachers={handleAssignTeachers}
                        onLinkGroups={handleLinkGroups}
                    />
                </div>

                <EditCourseModal
                    course={selectedCourse}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSave={handleSaveUpdate}
                />

                <AssignTeachersModal
                    course={selectedCourse}
                    open={assignTeachersOpen}
                    onOpenChange={setAssignTeachersOpen}
                    onSave={handleSaveTeachers}
                />

                <LinkGroupsModal
                    course={selectedCourse}
                    open={linkGroupsOpen}
                    onOpenChange={setLinkGroupsOpen}
                    onSave={handleSaveGroups}
                />
            </div>
        </ModuleGuard>
    );
}
