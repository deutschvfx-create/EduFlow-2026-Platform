'use client';

import { useState, useEffect } from "react";
// import { MOCK_COURSES } from "@/lib/mock/courses";
import { CourseFilters } from "@/components/courses/course-filters";
import { CoursesTable } from "@/components/courses/courses-table";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { EditCourseModal } from "@/components/courses/edit-course-modal";
import { AssignTeachersModal } from "@/components/courses/assign-teachers-modal";
import { LinkGroupsModal } from "@/components/courses/link-groups-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, XCircle, Archive } from "lucide-react";
import { Course } from "@/lib/types/course";
import { ModuleGuard } from "@/components/system/module-guard";

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

    useEffect(() => {
        import("@/lib/data/courses.repo").then(async ({ coursesRepo }) => {
            const data = await coursesRepo.getAll();
            setCourses(data as any);
            setIsLoaded(true);
        });
    }, []);

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

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

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

    const handleSaveUpdate = (id: string, updates: Partial<Course>) => {
        alert(`Предмет ${updates.code || id} обновлен`);
    };

    const handleSaveTeachers = (id: string, teacherIds: string[]) => {
        alert(`Преподаватели обновлены для предмета ${id}. Выбрано: ${teacherIds.length}`);
    };

    const handleSaveGroups = (id: string, groupIds: string[]) => {
        alert(`Группы обновлены для предмета ${id}. Выбрано: ${groupIds.length}`);
    };

    return (
        <ModuleGuard module="courses">
            <div className="space-y-6">
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
