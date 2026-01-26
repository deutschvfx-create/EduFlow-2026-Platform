"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, GraduationCap, Download, CheckCircle, AlertTriangle } from "lucide-react"
import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Plus, Copy, Check, ArrowRight, Loader2 } from "lucide-react"
import { getStoredUser } from "@/lib/auth-helpers"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"


function InviteStudentDialog() {
    const [email, setEmail] = useState("")
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleInvite = async () => {
        setLoading(true)
        try {
            const { data } = await api.post('/invites', { email })
            setLink(data.inviteLink)
        } catch (e) {
            alert("Failed to create invite")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4" />
                    Пригласить ученика
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Приглашение нового ученика</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Создайте уникальную ссылку-приглашение. Она будет действовать 7 дней.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!link ? (
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-200">Email ученика</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-950 border-zinc-700"
                                placeholder="student@example.com"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-zinc-200">Ссылка для регистрации</Label>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={link} className="bg-zinc-950 border-zinc-700 font-mono text-xs" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard} className="border-zinc-700 hover:bg-zinc-800">
                                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                Отправьте эту ссылку ученику. При регистрации его email ({email}) будет заполнен автоматически.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {!link && (
                        <Button onClick={handleInvite} disabled={loading || !email} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? 'Создание...' : 'Создать приглашение'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MyGroupsList() {
    const { data: groups, isLoading } = useQuery({
        queryKey: ['teacher-groups'], // Reusing same key/endpoint as it handles OWNER role
        queryFn: async () => {
            const { data } = await api.get('/teacher/groups')
            return data
        }
    })

    if (isLoading) return <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="animate-spin h-4 w-4" /> Загрузка групп...</div>

    if (!groups?.length) return <div className="text-zinc-500">Нет активных групп.</div>

    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
                {groups.map((g: any) => (
                    <Link key={g.id} href={`/teacher/groups/${g.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900 transition-all cursor-pointer group">
                            <div>
                                <h3 className="font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors">{g.name}</h3>
                                <p className="text-xs text-zinc-500">{g.schedule || 'Без расписания'}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-zinc-500 group-hover:text-indigo-400">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                ))}
            </div>
        </ScrollArea>
    )
}

export default function DirectorDashboard() {
    const router = useRouter()

    // Client-side RBAC check
    useEffect(() => {
        const user = getStoredUser();
        if (user) {
            if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/stats')
            return data
        }
    })

    if (isLoading) return <div className="p-8 text-zinc-400">Loading stats...</div>

    const isUniversity = stats?.orgType === 'University'

    return (
        <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-400">
                        {isUniversity ? 'Ректорат' : 'Обзор директора'}
                    </h1>
                    <p className="text-zinc-400">
                        {isUniversity
                            ? 'Управление университетом, кафедрами и успеваемостью.'
                            : 'Управляйте показателями вашей языковой школы.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                        <Download className="h-4 w-4" />
                        Скачать отчет в PDF
                    </Button>
                    <InviteStudentDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* GLOBAL STATS - Common for both */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            {isUniversity ? 'Всего студентов' : 'Учеников'}
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-400">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-zinc-500">+20% с прошлого месяца</p>
                    </CardContent>
                </Card>

                {/* DYNAMIC CARD 1: Semesters (Uni) vs Teachers (School) */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            {isUniversity ? 'Текущий семестр' : 'Преподавателей'}
                        </CardTitle>
                        <Users className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        {isUniversity ? (
                            <>
                                <div className="text-2xl font-bold text-white">Весенний 2026</div>
                                <p className="text-xs text-zinc-500">14 недель до сессии</p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-white">{stats?.totalTeachers || 0}</div>
                                <p className="text-xs text-zinc-500">2 новые заявки</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* DYNAMIC CARD 2: Departments (Uni) vs Active Groups (School) */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            {isUniversity ? 'Кафедры' : 'Активные группы'}
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        {isUniversity ? (
                            <>
                                <div className="text-2xl font-bold text-white">12</div>
                                <p className="text-xs text-zinc-500">Все работают</p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-white">{stats?.activeGroups || 0}</div>
                                <p className="text-xs text-zinc-500">Все по расписанию</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* DYNAMIC CARD 3: ECTS (Uni) vs Revenue (School) */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">
                            {stats?.orgType === 'University' ? 'Средний ECTS' : 'Выручка (USD)'}
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        {stats?.orgType === 'University' ? (
                            <>
                                <div className="text-2xl font-bold text-emerald-400">28.5</div>
                                <p className="text-xs text-zinc-500">Выше нормы (30)</p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-emerald-400">$12,450</div>
                                <p className="text-xs text-zinc-500">+15% к плану</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {stats?.orgType === 'University' ? 'Научная деятельность' : 'Посещаемость за неделю'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-zinc-500">
                            {stats?.orgType === 'University' ? 'График публикаций (Chart Placeholder)' : 'График посещаемости (Chart Placeholder)'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Последние уведомления</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {stats?.orgType === 'University' ? 'Приказ №45 утвержден' : 'Новая группа A1'}
                                    </p>
                                    <p className="text-xs text-zinc-500">2 часа назад</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
