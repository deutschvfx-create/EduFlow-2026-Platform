'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Loader2, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherRole } from "@/lib/types/teacher";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export function AddTeacherModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentOrganizationId } = useOrganization();

    // Mock Toast
    const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) };

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [role, setRole] = useState<TeacherRole>("teacher");

    // Invite State
    const [inviteCode, setInviteCode] = useState("");

    const handleManualSubmit = async () => {
        if (!firstName || !lastName) {
            alert("Заполните обязательные поля");
            return;
        }

        setLoading(true);

        try {
            const { teachersRepo } = await import("@/lib/data/teachers.repo");
            await teachersRepo.add(currentOrganizationId!, {
                id: generateId(),
                organizationId: currentOrganizationId!,
                firstName,
                lastName,
                specialization,
                role,
                status: 'ACTIVE',
                groupIds: [],
                email: `${firstName.toLowerCase()}@eduflow.com`,
                createdAt: new Date().toISOString(),
                permissions: {
                    canCreateGroups: role === 'admin',
                    canManageStudents: true,
                    canMarkAttendance: true,
                    canGradeStudents: true,
                    canSendAnnouncements: role === 'admin',
                    canUseChat: true,
                    canInviteStudents: role === 'admin'
                }
            });

            setOpen(false);

            // Reset form
            setFirstName("");
            setLastName("");
            setSpecialization("");
            setRole("TEACHER");

            toast.success("Преподаватель создан");

            window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Ошибка при создании преподавателя");
        } finally {
            setLoading(false);
        }
    };

    const generateInvite = () => {
        setInviteCode("T-" + Math.random().toString(36).substring(7).toUpperCase());
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить преподавателя
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление преподавателя</DialogTitle>
                    <DialogDescription>Создайте учетную запись вручную или пригласите по ссылке</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-950">
                        <TabsTrigger value="manual">Вручную</TabsTrigger>
                        <TabsTrigger value="invite">Приглашение</TabsTrigger>
                    </TabsList>

                    {/* MANUAL TAB */}
                    <TabsContent value="manual" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Имя *</Label>
                                <Input
                                    placeholder="Иван"
                                    className="bg-zinc-950 border-zinc-800"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Фамилия *</Label>
                                <Input
                                    placeholder="Петров"
                                    className="bg-zinc-950 border-zinc-800"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Специализация</Label>
                            <Input
                                placeholder="Например: Английский язык"
                                className="bg-zinc-950 border-zinc-800"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Роль</Label>
                            <Select value={role} onValueChange={(r) => setRole(r as TeacherRole)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teacher">Учитель</SelectItem>
                                    <SelectItem value="curator">Куратор</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
                            <Button onClick={handleManualSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Создать
                            </Button>
                        </div>
                    </TabsContent>

                    {/* INVITE TAB */}
                    <TabsContent value="invite" className="py-4 space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 rounded-lg">
                            <div className="text-center space-y-2">
                                <Mail className="h-10 w-10 text-zinc-500 mx-auto" />
                                <h3 className="text-lg font-medium">Код приглашения</h3>
                                <p className="text-sm text-zinc-400">Сгенерируйте код для быстрой регистрации преподавателя</p>
                            </div>

                            {!inviteCode ? (
                                <Button onClick={generateInvite} className="mt-4" variant="secondary">
                                    Сгенерировать код
                                </Button>
                            ) : (
                                <div className="mt-4 w-full max-w-xs space-y-2">
                                    <div className="flex gap-2">
                                        <Input value={inviteCode} readOnly className="bg-zinc-950 border-zinc-800 text-center font-mono font-bold" />
                                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(inviteCode)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-center text-zinc-500">Действует 24 часа</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
