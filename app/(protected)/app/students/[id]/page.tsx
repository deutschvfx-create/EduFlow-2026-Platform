'use client';

import { useParams, useRouter } from "next/navigation";
import { MOCK_STUDENTS } from "@/lib/mock/students";
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
    ExternalLink
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
import { motion } from "framer-motion";

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const student = MOCK_STUDENTS.find(s => s.id === id);

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
                        <Avatar className="h-32 w-32 rounded-2xl border-2 border-zinc-800 ring-4 ring-zinc-900/50 shadow-2xl relative z-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} alt={student.firstName} />
                            <AvatarFallback className="bg-zinc-950 text-indigo-400 text-3xl font-black">
                                {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-2 right-2 z-20 h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center hover:text-white hover:bg-zinc-800 transition-all">
                            <Camera className="h-4 w-4" />
                        </button>
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
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> В школе с {new Date(student.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {student.email || 'Нет email'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 px-6">
                                    <Phone className="mr-2 h-4 w-4" /> Позвонить
                                </Button>
                                <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl">
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
                                        <DropdownMenuItem className="cursor-pointer py-2"><Archive className="mr-2 h-4 w-4" /> В архив</DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        <DropdownMenuItem className="text-rose-400 cursor-pointer py-2 hover:bg-rose-500/10"><ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Performance Quick Dashboard */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Посещаемость</div>
                                    <div className="text-sm font-black text-white">92%</div>
                                </div>
                            </div>
                            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Award className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Средний балл</div>
                                    <div className="text-sm font-black text-white">4.8</div>
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
            <div className="grid lg:grid-cols-3 gap-6">
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
                                        {student.groups.length > 0 ? student.groups.map(g => (
                                            <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-tighter">
                                                {g.name}
                                            </Badge>
                                        )) : <span className="text-zinc-600 italic text-[10px]">Нет групп</span>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-800/30">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Прописка / Адрес</span>
                                    <span className="text-zinc-300 font-medium text-xs">г. Москва, ул. Пушкина 12</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-800/30">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Документ (ИНН)</span>
                                    <span className="text-zinc-300 font-medium text-xs">1234567890</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Родитель</span>
                                    <div className="text-right">
                                        <div className="text-zinc-300 font-bold text-xs">Анна Смирнова</div>
                                        <div className="text-[9px] text-zinc-600">+7 900 123 45 67</div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl text-xs font-bold uppercase tracking-widest py-6 border border-dashed border-indigo-500/20 group">
                                <ExternalLink className="mr-2 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                Посмотреть все документы
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Access Groups */}
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black">
                                ?
                            </div>
                            <div>
                                <div className="text-sm font-black text-white">Нужна помощь?</div>
                                <div className="text-xs text-indigo-300/60 font-medium">Справка по управлению студентом</div>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-zinc-950 font-black text-xs uppercase tracking-widest py-5 rounded-xl hover:bg-zinc-200 transition-colors">
                            Открыть руководство
                        </Button>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-between bg-zinc-900/60 p-1.5 rounded-2xl border border-white/5 h-auto overflow-x-auto gap-2">
                            <TabsTrigger value="general" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Обзор</TabsTrigger>
                            <TabsTrigger value="attendance" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Журнал</TabsTrigger>
                            <TabsTrigger value="grades" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Оценки</TabsTrigger>
                            <TabsTrigger value="payments" className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Платежи</TabsTrigger>
                        </TabsList>

                        <div className="mt-8 space-y-6">
                            <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black text-white uppercase text-xs tracking-widest">Ближайшее занятие</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-2xl font-black text-white">Завтра, 14:00</div>
                                            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest">English A1 — Intermediate</div>
                                        </div>
                                    </Card>
                                    <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black text-white uppercase text-xs tracking-widest">Последний платеж</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-2xl font-black text-white">12,500 ₽</div>
                                            <div className="text-xs font-bold text-teal-500 uppercase tracking-widest">Оплачено — 14.01.2026</div>
                                        </div>
                                    </Card>
                                </div>

                                <Card className="bg-zinc-900/40 border-zinc-800 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-zinc-950/50 border border-zinc-800 flex items-center justify-center">
                                        <Edit className="h-8 w-8 text-zinc-700" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold">Личные заметки</h4>
                                        <p className="text-zinc-500 text-xs max-w-[300px]">Здесь вы можете добавить важную информацию об особенностях обучения студента.</p>
                                    </div>
                                    <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Добавить заметку</Button>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attendance" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-3xl p-8 text-center space-y-4">
                                    <p className="text-zinc-500 text-sm font-medium">История посещений загружается. Скоро здесь появится календарь активности ученика.</p>
                                    <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto opacity-20 filter grayscale">
                                        {Array.from({ length: 31 }).map((_, i) => (
                                            <div key={i} className="h-8 w-8 rounded-lg bg-zinc-800" />
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="grades" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-3xl p-8 text-center space-y-4">
                                    <p className="text-zinc-500 text-sm font-medium">Академический прогресс скоро будет доступен. Система анализирует средний балл.</p>
                                    <div className="h-32 w-full bg-zinc-800/20 rounded-2xl flex items-end justify-between p-4 opacity-10">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="w-4 bg-indigo-500" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-5 duration-700 outline-none">
                                <Card className="bg-zinc-900/40 border-zinc-800/50 rounded-3xl overflow-hidden">
                                    <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/20 flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">История транзакций</h3>
                                        <Button variant="link" className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest h-auto p-0 hover:text-indigo-300">Экспорт PDF</Button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <DollarSign className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Оплата обучения — Февраль</div>
                                                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">14.01.2026, 12:45</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-emerald-400">+ 12,500 ₽</div>
                                                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Карта (T-Pay)</div>
                                            </div>
                                        </div>
                                        <div className="text-center py-10">
                                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Предыдущих платежей не найдено</p>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
