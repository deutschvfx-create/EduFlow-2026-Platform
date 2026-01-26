'use client';

import { useParams, useRouter } from "next/navigation";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Shield, ShieldAlert, Archive, Trash, MoreVertical, Lock } from "lucide-react";
import { TeacherStatusBadge, TeacherRoleBadge } from "@/components/teachers/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditPermissionsModal } from "@/components/teachers/permissions-modal";
import { TeacherPermissions } from "@/lib/types/teacher";

export default function TeacherProfilePage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;

    // State for permissions modal
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

    const teacher = MOCK_TEACHERS.find(s => s.id === id);

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100">Преподаватель не найден</div>
                <Button onClick={() => router.push('/app/teachers')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSavePermissions = (teacherId: string, newPermissions: TeacherPermissions) => {
        // Mock save logic
        alert(`Permissions updated for teacher ${teacherId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/teachers')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {teacher.firstName} {teacher.lastName}
                        <TeacherStatusBadge status={teacher.status} />
                        <TeacherRoleBadge role={teacher.role} />
                    </h1>
                    <div className="text-zinc-400 text-sm flex gap-4">
                        <span>ID: {teacher.id}</span>
                        <span>Добавлен: {new Date(teacher.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" onClick={() => setPermissionsModalOpen(true)}>
                        <Lock className="mr-2 h-4 w-4" /> Права
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />

                            <DropdownMenuItem onClick={() => setPermissionsModalOpen(true)} className="text-zinc-400 cursor-pointer hover:bg-zinc-800">
                                <Lock className="mr-2 h-4 w-4" /> Настроить доступ
                            </DropdownMenuItem>

                            {teacher.status !== 'ACTIVE' && (
                                <DropdownMenuItem className="text-green-400 cursor-pointer hover:bg-zinc-800">
                                    <Shield className="mr-2 h-4 w-4" /> Активировать
                                </DropdownMenuItem>
                            )}

                            {teacher.status === 'ACTIVE' && (
                                <DropdownMenuItem className="text-amber-400 cursor-pointer hover:bg-zinc-800">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem className="text-zinc-500 cursor-pointer hover:bg-zinc-800">
                                <Archive className="mr-2 h-4 w-4" /> В архив
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Info Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-200">Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Email</div>
                            <div className="text-zinc-300">{teacher.email || 'Не указан'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Специализация</div>
                            <div className="text-zinc-300">{teacher.specialization || '—'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Группы</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {teacher.groups.length > 0 ? teacher.groups.map(g => (
                                    <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-zinc-300">
                                        {g.name}
                                    </Badge>
                                )) : <span className="text-zinc-500 italic text-sm">Нет групп</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Последняя активность</div>
                            <div className="text-zinc-300">
                                {teacher.lastActivityAt ? new Date(teacher.lastActivityAt).toLocaleString() : '—'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-auto p-0">
                            <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Общее</TabsTrigger>
                            <TabsTrigger value="groups" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Группы</TabsTrigger>
                            <TabsTrigger value="permissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Настройки доступа</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="general">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>Статистика работы скоро появится.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="groups">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>Управление группами учителя в разработке.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="permissions">
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-zinc-200">Текущие права</CardTitle>
                                        <CardDescription>Только просмотр. Для изменения нажмите "Настроить доступ".</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-2">
                                        {Object.entries(teacher.permissions).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                                                <span className="text-zinc-400 font-mono text-sm">{key}</span>
                                                {value ? (
                                                    <Badge variant="outline" className="text-green-500 border-green-500/20">Да</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-500 border-red-500/20">Нет</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <EditPermissionsModal
                teacher={teacher}
                open={permissionsModalOpen}
                onOpenChange={setPermissionsModalOpen}
                onSave={handleSavePermissions}
            />
        </div>
    );
}
