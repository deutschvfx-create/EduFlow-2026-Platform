'use client';

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Users, GraduationCap, LayoutDashboard, DoorOpen } from "lucide-react";
import { FacultyStatusBadge } from "@/components/faculties/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { EditFacultyModal } from "@/components/faculties/edit-faculty-modal";
import { Faculty } from "@/lib/types/faculty";
import { useOrganization } from "@/hooks/use-organization";

export default function FacultyDetailsPage() {
    const params = useParams(); // { id: string }
    const router = useRouter();
    const id = params?.id as string;
    const { currentOrganizationId } = useOrganization();

    // State
    const [faculty, setFaculty] = useState<Faculty | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (currentOrganizationId && id) {
            import("@/lib/data/faculties.repo").then(async ({ facultiesRepo }) => {
                const data = await facultiesRepo.getById(currentOrganizationId, id);
                setFaculty(data);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, id]);

    if (loading) return <div className="p-8 text-muted-foreground">Загрузка данных...</div>;

    if (!faculty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-foreground">Факультет не найден</div>
                <Button onClick={() => router.push('/app/faculties')} variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSaveUpdate = async (id: string, updates: Partial<Faculty>) => {
        if (!currentOrganizationId) return;
        try {
            const { facultiesRepo } = await import("@/lib/data/faculties.repo");
            await facultiesRepo.update(currentOrganizationId, faculty.id, updates);
            setFaculty(prev => prev ? { ...prev, ...updates } : null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении факультета");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/app/faculties')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        {faculty.name}
                        <FacultyStatusBadge status={faculty.status} />
                    </h1>
                    <div className="text-muted-foreground text-sm flex gap-4">
                        <span className="font-mono bg-secondary px-2 rounded text-foreground">{faculty.code}</span>
                        <span>Добавлен: {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {faculty.status !== 'ARCHIVED' && (
                        <Button variant="outline" className="border-border bg-card text-foreground hover:bg-secondary" onClick={() => setEditModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                        </Button>
                    )}
                    <Button variant="secondary" className="gap-2 text-muted-foreground hover:text-red-400 hover:bg-card">
                        <Archive className="h-4 w-4" /> В архив
                    </Button>
                </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Кафедры</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                            {faculty.departmentsCount || 0}
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Info Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card border-border md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-semibold">Описание</div>
                            <div className="text-foreground text-sm leading-relaxed">{faculty.description || 'Описание отсутствует'}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start bg-card border-b border-border rounded-none h-auto p-0">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-3 px-6 text-muted-foreground">Обзор</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="overview">
                                <Card className="bg-card border-border border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <p>Сводная статистика и KPI факультета</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <EditFacultyModal
                faculty={faculty}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSave={handleSaveUpdate}
            />
        </div>
    );
}
