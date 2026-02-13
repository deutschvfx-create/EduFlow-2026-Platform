'use client';

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Users, GraduationCap, BookOpen, BarChart3, FileText, Settings } from "lucide-react";
import { CourseStatusBadge, CourseLevelBadge } from "@/components/courses/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { EditCourseModal } from "@/components/courses/edit-course-modal";
import { AssignTeachersModal } from "@/components/courses/assign-teachers-modal";
import { LinkGroupsModal } from "@/components/courses/link-groups-modal";
import { CurriculumEditor } from "@/components/courses/curriculum-editor";
import { GradingConfigurator } from "@/components/courses/grading-configurator";
import { MaterialsManager } from "@/components/courses/materials-manager";
import { ArchiveCourseModal } from "@/components/courses/archive-course-modal";
import { CourseAnalytics } from "@/components/courses/course-analytics";
import { Course } from "@/lib/types/course";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/hooks/use-organization";

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { currentOrganizationId } = useOrganization();

    // State
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignTeachersOpen, setAssignTeachersOpen] = useState(false);
    const [linkGroupsOpen, setLinkGroupsOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);

    useEffect(() => {
        if (currentOrganizationId && id) {
            import("@/lib/data/courses.repo").then(async ({ coursesRepo }) => {
                const data = await coursesRepo.getById(currentOrganizationId, id);
                setCourse(data);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, id]);

    if (loading) return <div className="p-8 text-muted-foreground">Загрузка данных...</div>;

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-foreground">Предмет не найден</div>
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
            await coursesRepo.update(currentOrganizationId, course.id, updates);
            setCourse(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении предмета");
        }
    };

    const handleSaveTeachers = async (id: string, teacherIds: string[], teachers?: import("@/lib/types/course").TeacherAssignment[]) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            const updates: any = { teacherIds };
            if (teachers) {
                updates.teachers = teachers;
            }
            await coursesRepo.update(currentOrganizationId, course.id, updates);
            setCourse(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveGroups = async (id: string, groupIds: string[]) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.update(currentOrganizationId, course.id, { groupIds });
            setCourse(prev => prev ? { ...prev, groupIds } : null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleArchive = async (courseId: string, reason: string, notes?: string) => {
        if (!currentOrganizationId) return;
        try {
            const { coursesRepo } = await import("@/lib/data/courses.repo");
            await coursesRepo.update(currentOrganizationId, courseId, {
                status: "ARCHIVED",
                archiveInfo: {
                    archivedAt: new Date().toISOString(),
                    archivedByUid: "current-user", // TODO: Get from auth
                    reason,
                    notes
                }
            });
            router.push('/app/courses');
        } catch (error) {
            console.error(error);
            alert("Ошибка при архивации предмета");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/courses')} className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-foreground">{course.name}</h1>
                        <CourseStatusBadge status={course.status} />
                        {course.level && <CourseLevelBadge level={course.level} />}
                        <Badge variant="outline" className="bg-secondary/30 border-border text-muted-foreground font-mono text-xs">
                            {course.version}
                        </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm flex gap-4 items-center mt-1">
                        <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-foreground text-xs">{course.code}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{course.type === 'MANDATORY' ? 'Обязательный' : course.type === 'ELECTIVE' ? 'Элективный' : course.type === 'OPTIONAL' ? 'Факультативный' : 'Интенсив'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {course.status !== 'ARCHIVED' && (
                        <Button variant="outline" className="border-border bg-card/50 text-foreground hover:bg-secondary" onClick={() => setEditModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                        </Button>
                    )}
                    {course.status !== 'ARCHIVED' && (
                        <Button variant="secondary" className="gap-2 text-muted-foreground hover:text-amber-400 hover:bg-card" onClick={() => setArchiveModalOpen(true)}>
                            <Archive className="h-4 w-4" /> В архив
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/30 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Часов в неделю</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{course.workload?.hoursPerWeek || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/30 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Модулей</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{course.modules?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/30 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Преподаватели</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                            {course.teacherIds?.length || 0}
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/30 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Группы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                            {course.groupIds?.length || 0}
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-card/30 border border-border/50 rounded-xl h-auto p-1 flex-wrap gap-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-lg px-4 py-2 text-muted-foreground text-sm font-medium">
                        <FileText className="h-4 w-4 mr-2" /> Обзор
                    </TabsTrigger>
                    <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-lg px-4 py-2 text-muted-foreground text-sm font-medium">
                        <BookOpen className="h-4 w-4 mr-2" /> Учебный план
                    </TabsTrigger>
                    <TabsTrigger value="grading" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-lg px-4 py-2 text-muted-foreground text-sm font-medium">
                        <Settings className="h-4 w-4 mr-2" /> Оценивание
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-lg px-4 py-2 text-muted-foreground text-sm font-medium">
                        <FileText className="h-4 w-4 mr-2" /> Материалы
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-lg px-4 py-2 text-muted-foreground text-sm font-medium">
                        <BarChart3 className="h-4 w-4 mr-2" /> Аналитика
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="overview" className="space-y-4">
                        <Card className="bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-foreground">Информация о предмете</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.objective && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Цель</div>
                                        <div className="text-foreground text-sm leading-relaxed">{course.objective}</div>
                                    </div>
                                )}
                                {course.description && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Описание</div>
                                        <div className="text-foreground text-sm leading-relaxed">{course.description}</div>
                                    </div>
                                )}

                                {/* Teacher Assignments */}
                                {course.teachers && course.teachers.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Преподаватели</div>
                                        <div className="flex flex-wrap gap-2">
                                            {course.teachers.map(assignment => (
                                                <Badge key={assignment.userId} variant="outline" className="bg-secondary/30 border-border text-foreground px-3 py-1">
                                                    <span className="text-xs">
                                                        {assignment.role === 'PRIMARY' ? '👨‍🏫' : assignment.role === 'ASSISTANT' ? '🤝' : '🔄'}
                                                        {' '}{assignment.userId.substring(0, 8)}...
                                                    </span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col gap-2">
                                    <Button variant="outline" className="w-full border-border hover:bg-secondary" onClick={() => setAssignTeachersOpen(true)}>
                                        <GraduationCap className="mr-2 h-4 w-4" /> Назначить преподавателей
                                    </Button>
                                    <Button variant="outline" className="w-full border-border hover:bg-secondary" onClick={() => setLinkGroupsOpen(true)}>
                                        <Users className="mr-2 h-4 w-4" /> Привязать группы
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="curriculum">
                        <Card className="bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-foreground">Учебный план</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CurriculumEditor
                                    modules={course.modules || []}
                                    onUpdate={async (modules) => {
                                        if (!currentOrganizationId) return;
                                        try {
                                            const { coursesRepo } = await import("@/lib/data/courses.repo");
                                            await coursesRepo.update(currentOrganizationId, course.id, { modules });
                                            setCourse(prev => prev ? { ...prev, modules } : null);
                                        } catch (error) {
                                            console.error(error);
                                            alert("Ошибка при обновлении модулей");
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="grading">
                        <Card className="bg-card/30 border-border/50">
                            <CardContent className="p-6">
                                <GradingConfigurator
                                    grading={course.grading || {
                                        type: "5_POINT",
                                        rounding: "NEAREST",
                                        minPassScore: 3,
                                        weights: { exams: 40, control: 30, homework: 20, participation: 10 }
                                    }}
                                    onUpdate={async (grading) => {
                                        if (!currentOrganizationId) return;
                                        try {
                                            const { coursesRepo } = await import("@/lib/data/courses.repo");
                                            await coursesRepo.update(currentOrganizationId, course.id, { grading });
                                            setCourse(prev => prev ? { ...prev, grading } : null);
                                        } catch (error) {
                                            console.error(error);
                                            alert("Ошибка при обновлении системы оценивания");
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="materials">
                        <Card className="bg-card/30 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-foreground">Материалы курса</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MaterialsManager
                                    materials={course.materials || []}
                                    onUpdate={async (materials) => {
                                        if (!currentOrganizationId) return;
                                        try {
                                            const { coursesRepo } = await import("@/lib/data/courses.repo");
                                            await coursesRepo.update(currentOrganizationId, course.id, { materials });
                                            setCourse(prev => prev ? { ...prev, materials } : null);
                                        } catch (error) {
                                            console.error(error);
                                            alert("Ошибка при обновлении материалов");
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card className="bg-card/30 border-border/50">
                            <CardContent className="p-6">
                                <CourseAnalytics courseId={course.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

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

            <ArchiveCourseModal
                course={course}
                open={archiveModalOpen}
                onOpenChange={setArchiveModalOpen}
                onArchive={handleArchive}
            />
        </div>
    );
}
