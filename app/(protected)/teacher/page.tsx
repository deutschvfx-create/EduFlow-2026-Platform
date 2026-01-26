'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Check, X, Clock, AlertCircle, ArrowRight, Loader2, Scan } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { APP_CONFIG, MOCK_ATTENDANCE } from "@/lib/data"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"

import { CreateGroupDialog } from "@/components/create-group-dialog"

function MyGroupsList() {
    const { data: groups, isLoading } = useQuery({
        queryKey: ['teacher-groups'],
        queryFn: async () => {
            const { data } = await api.get('/teacher/groups')
            return data
        }
    })

    if (isLoading) return <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="animate-spin h-4 w-4" /> Загрузка групп...</div>

    if (!groups?.length) return <div className="text-zinc-500">У вас пока нет активных групп.</div>

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

export default function TeacherDashboard() {
    const isUniversity = APP_CONFIG.orgType === 'University';

    return (
        <div className="p-6 md:p-8 space-y-6 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-400">
                        {isUniversity ? 'Преподавательская (Кафедра)' : 'Рабочее место учителя'}
                    </h1>
                    <p className="text-zinc-400">
                        {isUniversity ? 'Журнал посещаемости и ведомости.' : 'Управляйте занятиями и заданиями.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/teacher/scanner">
                        <Button variant="outline" className="gap-2 border-dashed">
                            <Scan className="h-4 w-4" />
                            <span className="hidden sm:inline">Сканер</span>
                        </Button>
                    </Link>
                    <CreateGroupDialog />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Мои Группы</CardTitle>
                        <CardDescription>Управление студентами и успеваемостью</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MyGroupsList />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-zinc-200">Конструктор карточек</CardTitle>
                        <Button variant="secondary" size="sm">Создать набор</Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px] border-t border-zinc-800/50">
                        <div className="bg-zinc-800 w-48 h-32 rounded-xl mb-4 shadow-xl shadow-black/40 rotate-3 border border-zinc-700 flex items-center justify-center">
                            <span className="text-zinc-500 text-lg">Лицевая сторона</span>
                        </div>
                        <p className="text-zinc-400 text-sm">Создавайте интерактивные учебные материалы</p>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
