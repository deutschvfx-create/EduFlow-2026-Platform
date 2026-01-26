'use client';

import { useParams, useRouter } from "next/navigation";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Users, GraduationCap, Calendar, BookOpen, Building2 } from "lucide-react";
import { GroupStatusBadge, GroupLevelBadge, GroupPaymentBadge } from "@/components/groups/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { EditGroupModal } from "@/components/groups/edit-group-modal";
import { Group } from "@/lib/types/group";
import { Badge } from "@/components/ui/badge";

export default function GroupDetailsPage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;

    // State for edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);

    const group = MOCK_GROUPS_FULL.find(s => s.id === id);

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100">Группа не найдена</div>
                <Button onClick={() => router.push('/app/groups')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSaveUpdate = (id: string, updates: Partial<Group>) => {
        // Mock save logic
        alert(`Группа ${updates.code} обновлена`);
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/groups')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {group.name}
                        <GroupStatusBadge status={group.status} />
                    </h1>
                    <div className="text-zinc-400 text-sm flex gap-4 items-center mt-1">
                        <span className="font-mono bg-zinc-800 px-2 rounded text-zinc-300">{group.code}</span>
                        <span className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] h-4 py-0">{group.facultyCode}</Badge>
                            <span className="text-xs text-zinc-500">/</span>
                            <span className="text-xs">{group.departmentName}</span>
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {group.status !== 'ARCHIVED' && (
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
                        <CardTitle className="text-sm font-medium text-zinc-400">Студенты</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {group.studentsCount} <span className="text-zinc-600 text-lg font-normal">/ {group.maxStudents}</span>
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
                            {group.teachersCount}
                            <GraduationCap className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Предметы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {group.coursesCount}
                            <BookOpen className="h-4 w-4 text-zinc-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Посещаемость</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            95%
                            <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Info Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-200">Параметры</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Куратор</div>
                            <div className="text-zinc-300 font-medium">{group.curatorTeacherName || 'Не назначен'}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="space-y-1">
                                <div className="text-xs text-zinc-500 uppercase font-semibold">Уровень</div>
                                <GroupLevelBadge level={group.level} />
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-xs text-zinc-500 uppercase font-semibold">Оплата</div>
                                <GroupPaymentBadge type={group.paymentType} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Факультет</div>
                            <div className="text-zinc-300 font-medium">{group.facultyName}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Кафедра</div>
                            <div className="text-zinc-300 font-medium">{group.departmentName}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-auto p-0 flex-wrap">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Обзор</TabsTrigger>
                            <TabsTrigger value="students" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Студенты</TabsTrigger>
                            <TabsTrigger value="teachers" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Преподаватели</TabsTrigger>
                            <TabsTrigger value="courses" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Предметы</TabsTrigger>
                            <TabsTrigger value="schedule" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-4 text-zinc-400">Расписание</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="overview">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Активность группы, объявления и события</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="students">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Список студентов группы</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="teachers">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Преподаватели, закрепленные за группой</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="courses">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Учебный план группы</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="schedule">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                        <p>Расписание занятий</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <EditGroupModal
                group={group}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSave={handleSaveUpdate}
            />
        </div>
    );
}
