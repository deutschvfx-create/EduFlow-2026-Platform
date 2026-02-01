'use client';

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Users, GraduationCap, Calendar, BarChart3, Building2 } from "lucide-react";
import { CourseStatusBadge, CourseLevelBadge } from "@/components/courses/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { EditCourseModal } from "@/components/courses/edit-course-modal";
import { AssignTeachersModal } from "@/components/courses/assign-teachers-modal";
import { LinkGroupsModal } from "@/components/courses/link-groups-modal";
import { Course } from "@/lib/types/course";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/hooks/use-organization";

export default function CourseDetailsPage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;
    const { currentOrganizationId } = useOrganization();

    // State
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignTeachersOpen, setAssignTeachersOpen] = useState(false);
    const [linkGroupsOpen, setLinkGroupsOpen] = useState(false);

    useEffect(() => {
        if (currentOrganizationId && id) {
            import("@/lib/data/courses.repo").then(async ({ coursesRepo }) => {
                const data = await coursesRepo.getById(currentOrganizationId, id);
                setCourse(data);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, id]);

    if (loading) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100">Предмет не найден</div>
                <Button onClick={() => router.push('/app/courses')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSaveUpdate = async (id: string, updates: Partial<Course>) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.update(currentOrganizationId, { ...course, ...updates });
            setCourse(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении предмета");
        }
    };

    const handleSaveTeachers = async (id: string, teacherIds: string[]) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.update(currentOrganizationId, { ...course, teacherIds });
            setCourse(prev => prev ? { ...prev, teacherIds } : null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveGroups = async (id: string, groupIds: string[]) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.update(currentOrganizationId, { ...course, groupIds });
            setCourse(prev => prev ? { ...prev, groupIds } : null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/courses')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {course.name}
                        <CourseStatusBadge status={course.status} />
                    </h1>
                    <div className="text-zinc-400 text-sm flex gap-4 items-center mt-1">
                        <span className="font-mono bg-zinc-800 px-2 rounded text-zinc-300">{course.code}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {course.status !== 'ARCHIVED' && (
                        <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" onClick={() => setEditModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                        </Button>
                    )}
                    <Button variant="secondary" className="gap-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900">
                        <Archive className="h-4 w-4" /> В архив
                    </Button>
                </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Группы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {course.groupIds?.length || 0}
                            <Users className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Преподаватели</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {course.teacherIds?.length || 0}
                            <GraduationCap className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Info Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-200">Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Описание</div>
                            <div className="text-zinc-300 text-sm leading-relaxed">{course.description || 'Описание отсутствует'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Уровень</div>
                            <CourseLevelBadge level={course.level} />
                        </div>
                        <div className="pt-4 flex flex-col gap-2">
                            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" onClick={() => setAssignTeachersOpen(true)}>
                                <GraduationCap className="mr-2 h-4 w-4" /> Назначить препод.
                            </Button>
                            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" onClick={() => setLinkGroupsOpen(true)}>
                                <Users className="mr-2 h-4 w-4" /> Привязать группы
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-auto p-0 flex-wrap">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Обзор</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="overview">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Общая информация и новости по курсу</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <EditCourseModal
                course={course}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSave={handleSaveUpdate}
            />

            <AssignTeachersModal
                course={course}
                open={assignTeachersOpen}
                onOpenChange={setAssignTeachersOpen}
                onSave={handleSaveTeachers}
            />

            <LinkGroupsModal
                course={course}
                open={linkGroupsOpen}
                onOpenChange={setLinkGroupsOpen}
                onSave={handleSaveGroups}
            />
        </div>
    );
}
