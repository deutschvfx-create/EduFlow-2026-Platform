'use client';

import { useParams, useRouter } from "next/navigation";
import { MOCK_STUDENTS } from "@/lib/mock/students";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Shield, ShieldAlert, Archive, Trash, MoreVertical } from "lucide-react";
import { StudentStatusBadge } from "@/components/students/status-badge";
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

export default function StudentProfilePage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;

    const student = MOCK_STUDENTS.find(s => s.id === id);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100">Студент не найден</div>
                <Button onClick={() => router.push('/app/students')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/students')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {student.firstName} {student.lastName}
                        <StudentStatusBadge status={student.status} />
                    </h1>
                    <div className="text-zinc-400 text-sm flex gap-4">
                        <span>ID: {student.id}</span>
                        <span>Добавлен: {new Date(student.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
                        <Edit className="mr-2 h-4 w-4" /> Изменить
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
                            <DropdownMenuItem className="text-zinc-400 cursor-pointer hover:bg-zinc-800">
                                <Shield className="mr-2 h-4 w-4" /> Права доступа
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-zinc-800">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
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
                            <div className="text-zinc-300">{student.email || 'Не указан'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Дата рождения</div>
                            <div className="text-zinc-300">{new Date(student.birthDate).toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Группы</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {student.groups.length > 0 ? student.groups.map(g => (
                                    <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-zinc-300">
                                        {g.name}
                                    </Badge>
                                )) : <span className="text-zinc-500 italic text-sm">Нет групп</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Статус оплаты</div>
                            <div className="pt-1">
                                {student.paymentStatus === 'OK' && <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Оплачено</Badge>}
                                {student.paymentStatus === 'DUE' && <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Задолженность</Badge>}
                                {student.paymentStatus === 'UNKNOWN' && <Badge variant="outline" className="text-zinc-500 border-zinc-800">Нет данных</Badge>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-auto p-0">
                            <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Общее</TabsTrigger>
                            <TabsTrigger value="attendance" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Посещаемость</TabsTrigger>
                            <TabsTrigger value="grades" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Оценки</TabsTrigger>
                            <TabsTrigger value="payments" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none py-3 px-6 text-zinc-400">Платежи</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="general">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>Статистика и общая информация скоро появятся.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="attendance">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>Модуль посещаемости в разработке.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="grades">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>Журнал оценок скоро будет доступен.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="payments">
                                <Card className="bg-zinc-900 border-zinc-800 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                        <p>История платежей загружается...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
