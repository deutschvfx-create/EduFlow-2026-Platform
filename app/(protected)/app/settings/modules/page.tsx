
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { updateModulesConfig, getModulesConfig } from "@/app/actions";
import { Loader2, ArrowLeft } from "lucide-react";
import { useModules } from "@/hooks/use-modules";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ModulesSettingsPage() {
    const router = useRouter();
    const { modules, setAllModules, isLoaded } = useModules();
    const [saving, setSaving] = useState(false);

    const handleToggle = async (key: string, checked: boolean) => {
        const newConfig = { ...modules, [key as any]: checked };
        setSaving(true);
        await setAllModules(newConfig);
        setSaving(false);
        router.refresh(); // Refresh layout to update sidebar
    };

    if (!isLoaded) return <div className="text-muted-foreground">Loading...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link href="/app/settings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Модули платформы
                    </h1>
                    <p className="text-muted-foreground/70">Включайте только то, что нужно вашей организации</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* People */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Люди</CardTitle>
                        <CardDescription>Управление пользователями</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex flex-col gap-1">
                                <span>Студенты</span>
                                <span className="font-normal text-xs text-muted-foreground">Базовый модуль</span>
                            </Label>
                            <Switch checked={true} disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="teachers" className="flex flex-col gap-1">
                                <span>Преподаватели</span>
                                <span className="font-normal text-xs text-muted-foreground">Управление штатом</span>
                            </Label>
                            <Switch
                                id="teachers"
                                checked={modules.teachers}
                                onCheckedChange={(c) => handleToggle('teachers', c)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Structure */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Структура</CardTitle>
                        <CardDescription>Иерархия организации</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="faculties">Факультеты</Label>
                            <Switch id="faculties" checked={modules.faculties} onCheckedChange={(c) => handleToggle('faculties', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="departments">Кафедры</Label>
                            <Switch id="departments" checked={modules.departments} onCheckedChange={(c) => handleToggle('departments', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="groups">Группы</Label>
                            <Switch id="groups" checked={modules.groups} onCheckedChange={(c) => handleToggle('groups', c)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Education */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Обучение</CardTitle>
                        <CardDescription>Учебный процесс</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="courses">Предметы</Label>
                            <Switch id="courses" checked={modules.courses} onCheckedChange={(c) => handleToggle('courses', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="schedule">Расписание</Label>
                            <Switch id="schedule" checked={modules.schedule} onCheckedChange={(c) => handleToggle('schedule', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="attendance">Посещаемость</Label>
                            <Switch id="attendance" checked={modules.attendance} onCheckedChange={(c) => handleToggle('attendance', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="grades">Оценки</Label>
                            <Switch id="grades" checked={modules.grades} onCheckedChange={(c) => handleToggle('grades', c)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Communication */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Коммуникация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="announcements">Объявления</Label>
                            <Switch id="announcements" checked={modules.announcements} onCheckedChange={(c) => handleToggle('announcements', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="chat">Чаты</Label>
                            <Switch id="chat" checked={modules.chat} onCheckedChange={(c) => handleToggle('chat', c)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Аналитика</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reports">Отчёты</Label>
                            <Switch id="reports" checked={modules.reports} onCheckedChange={(c) => handleToggle('reports', c)} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            {saving && <div className="fixed bottom-4 right-4 bg-primary text-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-5"><Loader2 className="h-4 w-4 animate-spin" /> Сохранение...</div>}
        </div>
    );
}
