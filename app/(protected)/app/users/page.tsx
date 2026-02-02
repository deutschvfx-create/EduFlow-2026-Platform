'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRole } from "@/hooks/use-role";
import { useOrganization } from "@/hooks/use-organization";
import { UserService, UserData, UserRole } from "@/lib/services/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCog, ShieldAlert } from "lucide-react";

export default function UsersPage() {
    const { user } = useAuth();
    const { isOwner, role: myRole } = useRole();
    const { currentOrganizationId } = useOrganization();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingUid, setUpdatingUid] = useState<string | null>(null);

    useEffect(() => {
        if (currentOrganizationId && isOwner) {
            loadUsers();
        } else if (!isOwner && myRole) {
            setLoading(false);
        }
    }, [currentOrganizationId, isOwner, myRole]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers(currentOrganizationId!);
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
            alert("Ошибка при загрузке пользователей");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
        if (targetUid === user?.uid) {
            alert("Вы не можете изменить собственную роль");
            return;
        }

        setUpdatingUid(targetUid);
        try {
            await UserService.updateUser(targetUid, { role: newRole });
            setUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
            alert("Роль успешно обновлена");
        } catch (error) {
            console.error("Failed to update role:", error);
            alert("Не удалось обновить роль");
        } finally {
            setUpdatingUid(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold text-white">Доступ ограничен</h1>
                <p className="text-zinc-400">Только владельцы могут управлять ролями пользователей.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserCog className="h-6 w-6 text-indigo-400" />
                        Управление ролями
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Назначение должностей преподавателей и студентов
                    </p>
                </div>
                <Button variant="outline" onClick={loadUsers} size="sm" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                    Обновить список
                </Button>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Пользователь</TableHead>
                                <TableHead className="text-zinc-400">Email</TableHead>
                                <TableHead className="text-zinc-400">Текущая роль</TableHead>
                                <TableHead className="text-zinc-400 text-right">Назначить роль</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                        Пользователи не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.uid} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                        <TableCell className="font-medium text-white">
                                            {u.firstName} {u.lastName}
                                            {u.uid === user?.uid && (
                                                <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-400 border-none text-[10px]">ВЫ</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{u.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`capitalize border-none ${u.role === 'owner' ? 'bg-amber-500/10 text-amber-500' :
                                                    u.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-500' :
                                                        'bg-emerald-500/10 text-emerald-500'
                                                    }`}
                                            >
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {u.uid === user?.uid || u.role === 'owner' ? (
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Администратор</span>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Select
                                                        disabled={updatingUid === u.uid}
                                                        value={u.role}
                                                        onValueChange={(val) => handleRoleChange(u.uid, val as UserRole)}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-8 bg-zinc-950 border-zinc-800 text-xs text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectItem value="teacher">Преподаватель</SelectItem>
                                                            <SelectItem value="student">Студент</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
