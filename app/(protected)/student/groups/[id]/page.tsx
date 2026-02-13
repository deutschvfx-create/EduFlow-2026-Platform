
'use client';

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Ban, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function StudentGroupPage() {
    const { id } = useParams();

    // Fetch my groups to find this one and check status
    const { data: groups, isLoading } = useQuery({
        queryKey: ['my-groups'],
        queryFn: async () => {
            const { data } = await api.get('/student/groups');
            return data;
        }
    });

    if (isLoading) return <div className="p-8 text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Загрузка...</div>;

    const group = groups?.find((g: any) => g.id === id);

    if (!group) {
        return <div className="p-8 text-muted-foreground">Группа не найдена или вы не являетесь её участником.</div>;
    }

    // Status Check
    if (group.myStatus === 'PENDING') {
        return (
            <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-yellow-500/10 mb-6">
                    <Clock className="h-12 w-12 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Ожидание активации</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Вы успешно подали заявку на вступление в группу <span className="text-primary font-medium">"{group.name}"</span>.
                    Преподаватель должен подтвердить ваш доступ.
                </p>
                <Link href="/student">
                    <Button variant="outline" className="border-border text-foreground hover:bg-card">
                        Вернуться на главную
                    </Button>
                </Link>
            </div>
        );
    }

    if (group.myStatus === 'SUSPENDED') {
        return (
            <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-red-500/10 mb-6">
                    <Ban className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Доступ приостановлен</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Ваш доступ к группе <span className="text-primary font-medium">"{group.name}"</span> временно ограничен преподавателем.
                </p>
                <Link href="/student">
                    <Button variant="outline" className="border-border text-foreground hover:bg-card">
                        Вернуться на главную
                    </Button>
                </Link>
            </div>
        );
    }

    // ACTIVE CONTENT
    return (
        <div className="p-6 md:p-8 space-y-8 bg-background min-h-screen text-foreground">
            <div className="flex items-center gap-4">
                <Link href="/student">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-primary">{group.name}</h1>
                    <p className="text-muted-foreground">{group.schedule || 'Расписание не задано'}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-border">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] gap-4">
                        <BookOpen className="h-10 w-10 text-primary" />
                        <h2 className="text-xl font-medium text-white">Материалы курса</h2>
                        <p className="text-center text-muted-foreground text-sm">Доступ к учебникам и файлам</p>
                        <Button className="bg-secondary hover:bg-secondary text-foreground">Открыть</Button>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-medium text-white">Домашние задания</h2>
                        <p className="text-center text-muted-foreground text-sm">Нет активных заданий</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
