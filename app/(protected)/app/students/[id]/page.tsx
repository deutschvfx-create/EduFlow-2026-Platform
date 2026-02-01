'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Edit,
    Shield,
    ShieldAlert,
    Archive,
    Trash,
    MoreVertical,
    Phone,
    Mail,
    Camera,
    Calendar,
    Award,
    Clock,
    CheckCircle2,
    DollarSign,
    ExternalLink,
    FileText,
    Plus,
    X,
    ClipboardList,
    History
} from "lucide-react";
import { StudentStatusBadge } from "@/components/students/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCountdown } from "@/components/students/credit-countdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { Student } from "@/lib/types/student";
import { useOrganization } from "@/hooks/use-organization";

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { currentOrganizationId } = useOrganization();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<string>("");
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);

    useEffect(() => {
        if (currentOrganizationId && id) {
            import("@/lib/data/students.repo").then(async ({ studentsRepo }) => {
                const data = await studentsRepo.getById(currentOrganizationId, id);
                setStudent(data);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, id]);

    if (loading) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-black text-white tracking-widest uppercase">Студент не найден</div>
                <Button onClick={() => router.push('/app/students')} variant="secondary" className="rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </div>
        );
    }

    // Mock summaries for now until repos are created for these
    const attendanceSummary: any[] = [];
    const gradesSummary: any[] = [];
    const paymentsSummary: any[] = [];

    const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') => {
        if (!currentOrganizationId) return;
        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            await studentsRepo.update(currentOrganizationId, id, { status: newStatus } as any);
            setStudent(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Glassmorphism Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-1 shadow-2xl backdrop-blur-xl">
                {/* Background Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />

                <div className="relative z-10 p-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Avatar with Camera Overlay */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <Avatar className="h-32 w-32 rounded-2xl border-2 border-zinc-800 ring-4 ring-zinc-900/50 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} alt={student.firstName} />
                            <AvatarFallback className="bg-zinc-950 text-indigo-400 text-3xl font-black">
                                {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="absolute bottom-2 right-2 z-20 h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center hover:text-white hover:bg-zinc-800 transition-all">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 p-0 overflow-hidden">
                                <FeaturePlaceholder
                                    featureName="Система Хранения Медиа"
                                    plannedFeatures={[
                                        "Загрузка фото профиля в высоком качестве",
                                        "Автоматическая обрезка и оптимизация для веба",
                                        "Интеграция с Google Drive и Dropbox",
                                        "Хранение документов и справок в профиле",
                                        "Система распознавания лиц для быстрой идентификации"
                                    ]}
                                    benefits={[
                                        "Профессиональный вид личных дел",
                                        "Быстрая идентификация учеников сотрудниками",
                                        "Безопасное хранение конфиденциальных данных"
                                    ]}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-4xl font-black tracking-tighter text-white">
                                        {student.firstName} {student.lastName}
                                    </h1>
                                    <StudentStatusBadge status={student.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-sm font-bold">
                                    <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] border-zinc-700 bg-zinc-900/50 rounded-md">ID: {student.id}</Badge></span>
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> В школе с {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}</span>
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {student.email || 'Нет email'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 px-6 transition-all hover:scale-105 active:scale-95" onClick={() => window.open(`tel:${student.phone || '+7000000000'}`)}>
                                    <Phone className="mr-2 h-4 w-4" /> Позвонить
                                </Button>
                                <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl" onClick={() => window.open(`mailto:${student.email}`)}>
                                    <Mail className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[160px]">
                                        <DropdownMenuItem className="cursor-pointer py-2"><Edit className="mr-2 h-4 w-4" /> Изменить профиль</DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => handleStatusChange('ARCHIVED')} className="cursor-pointer py-2 text-zinc-400"><Archive className="mr-2 h-4 w-4" /> В архив</DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-zinc-800" />

                                        <DropdownMenuItem onClick={() => handleStatusChange('SUSPENDED')} className="text-rose-400 cursor-pointer py-2 hover:bg-rose-500/10"><ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Performance Quick Dashboard */}
                        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-4">
                            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Посещаемость</div>
                                    <div className="text-sm font-black text-white">{student.status === 'ACTIVE' ? '92%' : '0%'}</div>
                                </div>
                            </div>
                            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Award className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Средний балл</div>
                                    <div className="text-sm font-black text-white">{gradesSummary.length > 0 ? (gradesSummary.reduce((acc, g) => acc + g.value, 0) / gradesSummary.length).toFixed(1) : '—'}</div>
                                </div>
                            </div>
                            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3 md:col-span-2">
                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="w-full">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-0.5">Баланс (время)</div>
                                    <CreditCountdown paidUntil={student.paidUntil} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid laptop:grid-cols-3 gap-6">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900/60 border-zinc-800/50 rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/5">
                        <CardHeader className="p-6 border-b border-zinc-800/50 bg-zinc-950/20">
                            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Полные данные</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-800/30">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Группы ученика</span>
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {student.groupIds && student.groupIds.length > 0 ? (
                                            <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-tighter">
                                                {student.groupIds.length} {student.groupIds.length === 1 ? 'группа' : 'групп'}
                                            </span>
                                        ) : <span className="text-zinc-600 italic text-[10px]">Нет групп</span>}
                                    </div>
                                </div>
                            </div>

                            <Dialog open={isDocsOpen} onOpenChange={setIsDocsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl text-xs font-bold uppercase tracking-widest py-6 border border-dashed border-indigo-500/20 group">
                                        <ExternalLink className="mr-2 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        Посмотреть все документы
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg rounded-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-widest">Документы студента</DialogTitle>
                                        <DialogDescription className="text-zinc-500 text-xs font-bold uppercase">Архив личных документов и справок</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <p className="text-zinc-500 text-center py-4">Документы не найдены</p>
                                    </div>
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-6 font-black uppercase tracking-widest text-xs">
                                        <Plus className="mr-2 h-4 w-4" /> Загрузить новый документ
                                    </Button>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="laptop:col-span-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-between bg-zinc-900/60 p-1.5 rounded-2xl border border-white/5 h-auto overflow-x-auto gap-2">
                            <TabsTrigger value="general" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Обзор</TabsTrigger>
                            <TabsTrigger value="attendance" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Журнал</TabsTrigger>
                            <TabsTrigger value="grades" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Оценки</TabsTrigger>
                            <TabsTrigger value="payments" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Платежи</TabsTrigger>
                            <TabsTrigger value="analytics" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Аналитика</TabsTrigger>
                        </TabsList>

                        <div className="mt-8 space-y-6">
                            <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <AnimatePresence mode="wait">
                                    {isAddingNote ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <Card className="bg-zinc-900/40 border-indigo-500/30 rounded-3xl p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Новая заметка</h4>
                                                    <Button variant="ghost" size="icon" onClick={() => setIsAddingNote(false)} className="h-6 w-6 text-zinc-500 hover:text-rose-500">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Введите текст заметки..."
                                                    className="bg-zinc-950/50 border-zinc-800 rounded-xl min-h-[120px] text-zinc-200 placeholder:text-zinc-700"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsAddingNote(false)} className="rounded-xl text-xs font-bold uppercase tracking-widest border-zinc-800">Отмена</Button>
                                                    <Button onClick={() => { setIsAddingNote(false); alert("Заметка сохранена!"); }} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-widest">Сохранить</Button>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ) : (
                                        <Card className="bg-zinc-900/40 border-zinc-800 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="h-20 w-20 rounded-full bg-zinc-950/50 border border-zinc-800 flex items-center justify-center">
                                                <Edit className="h-8 w-8 text-zinc-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-white font-bold">Личные заметки</h4>
                                                <p className="text-zinc-500 text-xs max-w-[300px]">
                                                    {notes || "Здесь вы можете добавить важную информацию об особенностях обучения студента."}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAddingNote(true)}
                                                className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest py-5 px-6"
                                            >
                                                {notes ? "Изменить заметку" : "Добавить заметку"}
                                            </Button>
                                        </Card>
                                    )}
                                </AnimatePresence>
                            </TabsContent>

                            <TabsContent value="attendance" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none space-y-4">
                                <p className="text-zinc-500 text-center py-10 italic">История посещаемости пуста</p>
                            </TabsContent>
                            <TabsContent value="grades" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none space-y-4">
                                <p className="text-zinc-500 text-center py-10 italic">Оценки не найдены</p>
                            </TabsContent>
                            <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <p className="text-zinc-500 text-center py-10 italic">История платежей пуста</p>
                            </TabsContent>
                            <TabsContent value="analytics">
                                <FeaturePlaceholder featureName="AI Аналитика" plannedFeatures={["Прогноз успеваемости", "Анализ рисков"]} benefits={["Предотвращение отчислений"]} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
