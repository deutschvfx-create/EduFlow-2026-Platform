
'use client';

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, Ban, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { InviteQR } from "@/components/invite-qr";
import { Ticket, Copy, Printer } from "lucide-react";

function InviteDialog({ groupId }: { groupId: string }) {
    const [step, setStep] = useState<'CONFIG' | 'RESULT'>('CONFIG');
    const [expires, setExpires] = useState("60"); // minutes
    const [maxUses, setMaxUses] = useState("1");
    const [inviteData, setInviteData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/groups/${groupId}/invites`, {
                expiresInMinutes: parseInt(expires),
                maxUses: maxUses === 'unlimited' ? null : parseInt(maxUses)
            });
            setInviteData(data);
            setStep('RESULT');
        } catch (e) {
            console.error(e);
            alert("Failed to create invite");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('CONFIG');
        setInviteData(null);
    };

    return (
        <Dialog onOpenChange={(open) => !open && reset()}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Ticket className="h-4 w-4" /> Пригласить студентов
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Создание приглашения</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Сгенерируйте код или QR для входа студентов.
                    </DialogDescription>
                </DialogHeader>

                {step === 'CONFIG' ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Срок действия</Label>
                            <Select value={expires} onValueChange={setExpires}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectItem value="10">10 минут</SelectItem>
                                    <SelectItem value="60">1 час</SelectItem>
                                    <SelectItem value="1440">24 часа</SelectItem>
                                    <SelectItem value="10080">7 дней</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Лимит использования</Label>
                            <Select value={maxUses} onValueChange={setMaxUses}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectItem value="1">Одноразовый (1 студент)</SelectItem>
                                    <SelectItem value="unlimited">Многоразовый (Вся группа)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerate} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                            {loading ? 'Создание...' : 'Сгенерировать'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 flex flex-col items-center">
                        <div className="text-center space-y-2">
                            <div className="text-zinc-400 text-sm">Код приглашения</div>
                            <div className="text-4xl font-mono font-bold tracking-widest text-white select-all bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                {inviteData?.token}
                            </div>
                        </div>

                        <InviteQR value={inviteData?.token} />

                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => navigator.clipboard.writeText(inviteData?.token)}>
                                <Copy className="mr-2 h-4 w-4" /> Копировать
                            </Button>
                            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Печать
                            </Button>
                        </div>

                        <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-300" onClick={reset}>
                            Создать новое
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function GroupDetailsPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();

    // Fetch members
    const { data: members, isLoading } = useQuery({
        queryKey: ['group-members', id],
        queryFn: async () => {
            const { data } = await api.get(`/groups/${id}/members`);
            return data;
        }
    });

    // Mutation for status update
    const updateStatusMutation = useMutation({
        mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
            await api.patch(`/groups/${id}/members/${userId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-members', id] });
        }
    });

    // Mutation for removal
    const removeMemberMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/groups/${id}/members/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-members', id] });
        }
    });

    if (isLoading) return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="animate-spin" /> Загрузка...</div>;

    const translateStatus = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Активен';
            case 'PENDING': return 'Ожидает';
            case 'SUSPENDED': return 'Приостановлен';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'SUSPENDED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    };

    return (
        <div className="p-8 space-y-6 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/teacher">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Управление группой</h1>
                        <p className="text-zinc-400">Список студентов и модерация</p>
                    </div>
                </div>
                {/* Invite Button Component */}
                {/* @ts-ignore */}
                <InviteDialog groupId={id} />
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900">
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                            <TableHead className="text-zinc-400">Имя Студента</TableHead>
                            <TableHead className="text-zinc-400">Email</TableHead>
                            <TableHead className="text-zinc-400">Дата присоединения</TableHead>
                            <TableHead className="text-zinc-400">Статус</TableHead>
                            <TableHead className="text-right text-zinc-400">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members?.map((member: any) => (
                            <TableRow key={member.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableCell className="font-medium text-white">{member.name}</TableCell>
                                <TableCell className="text-zinc-400">{member.email}</TableCell>
                                <TableCell className="text-zinc-500">
                                    {new Date(member.joinedAt).toLocaleDateString('ru-RU')}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`border ${getStatusColor(member.status)}`}>
                                        {translateStatus(member.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            {member.status !== 'ACTIVE' && (
                                                <DropdownMenuItem
                                                    className="focus:bg-emerald-900/50 focus:text-emerald-400 cursor-pointer"
                                                    onClick={() => updateStatusMutation.mutate({ userId: member.id, status: 'ACTIVE' })}
                                                >
                                                    <Check className="mr-2 h-4 w-4" /> Активировать
                                                </DropdownMenuItem>
                                            )}
                                            {member.status !== 'SUSPENDED' && (
                                                <DropdownMenuItem
                                                    className="focus:bg-yellow-900/50 focus:text-yellow-400 cursor-pointer"
                                                    onClick={() => updateStatusMutation.mutate({ userId: member.id, status: 'SUSPENDED' })}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" /> Приостановить
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="focus:bg-red-900/50 focus:text-red-400 cursor-pointer"
                                                onClick={() => {
                                                    if (confirm('Вы уверены, что хотите удалить этого студента?')) {
                                                        removeMemberMutation.mutate(member.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Удалить из группы
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {members?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    В этой группе пока нет студентов.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
