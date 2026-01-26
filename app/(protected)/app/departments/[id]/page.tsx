'use client';

import { useParams, useRouter } from "next/navigation";
import { MOCK_DEPARTMENTS } from "@/lib/mock/departments";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Users, GraduationCap, LayoutDashboard, BookOpen, Building2 } from "lucide-react";
import { DepartmentStatusBadge } from "@/components/departments/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { EditDepartmentModal } from "@/components/departments/edit-department-modal";
import { Department } from "@/lib/types/department";
import { Badge } from "@/components/ui/badge";

export default function DepartmentDetailsPage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;

    // State for edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);

    const department = MOCK_DEPARTMENTS.find(s => s.id === id);

    if (!department) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100">Кафедра не найдена</div>
                <Button onClick={() => router.push('/app/departments')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSaveUpdate = (id: string, updates: Partial<Department>) => {
        // Mock save logic
        alert(`Кафедра ${updates.code} обновлена`);
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/departments')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {department.name}
                        <DepartmentStatusBadge status={department.status} />
                    </h1>
                    <div className="text-zinc-400 text-sm flex gap-4 items-center mt-1">
                        <span className="font-mono bg-zinc-800 px-2 rounded text-zinc-300">{department.code}</span>
                        <span className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {department.facultyName} <Badge variant="secondary" className="text-[10px] h-4 py-0">{department.facultyCode}</Badge>
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {department.status !== 'ARCHIVED' && (
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
                        <CardTitle className="text-sm font-medium text-zinc-400">Преподаватели</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {department.teachersCount}
                            <GraduationCap className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Группы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {department.groupsCount}
                            <LayoutDashboard className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Студенты</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {department.studentsCount}
                            <Users className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Предметы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {department.coursesCount}
                            <BookOpen className="h-4 w-4 text-zinc-600" />
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
                            <div className="text-zinc-300 text-sm leading-relaxed">{department.description || 'Описание отсутствует'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Руководитель (Зав. кафедрой)</div>
                            <div className="text-zinc-300 font-medium">{department.headTeacherName || 'Не назначен'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Дата создания</div>
                            <div className="text-zinc-300 font-medium">{new Date(department.createdAt).toLocaleDateString()}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-auto p-0">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Обзор</TabsTrigger>
                            <TabsTrigger value="teachers" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Преподаватели</TabsTrigger>
                            <TabsTrigger value="groups" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Группы</TabsTrigger>
                            <TabsTrigger value="courses" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Предметы</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="overview">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Сводная статистика кафедры</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="teachers">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Состав кафедры</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="groups">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Список учебных групп кафедры</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="courses">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Список дисциплин (предметов)</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <EditDepartmentModal
                department={department}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSave={handleSaveUpdate}
            />
        </div>
    );
}
