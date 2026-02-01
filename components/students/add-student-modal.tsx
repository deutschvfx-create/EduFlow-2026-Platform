'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Mail, Camera, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { Group } from "@/lib/types/group";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export function AddStudentModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentOrganizationId } = useOrganization();

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [groupId, setGroupId] = useState("");
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        if (open && currentOrganizationId) {
            import("@/lib/data/groups.repo").then(({ groupsRepo }) => {
                groupsRepo.getAll(currentOrganizationId).then(setGroups);
            });
        }
    }, [open, currentOrganizationId]);

    const handleManualSubmit = async () => {
        if (!firstName || !lastName || !birthDate) {
            alert("Заполните обязательные поля");
            return;
        }
        if (firstName.length < 2) {
            alert("Имя слишком короткое");
            return;
        }

        const date = new Date(birthDate);
        if (isNaN(date.getTime())) {
            alert("Некорректная дата");
            return;
        }

        setLoading(true);

        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            studentsRepo.add({
                id: generateId(),
                organizationId: currentOrganizationId!,
                firstName,
                lastName,
                birthDate: new Date(birthDate).toISOString(),
                status: 'ACTIVE',
                groupIds: groupId ? [groupId] : [],
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.eduflow.com`, // Auto-generate email
                phone: '',
                paymentStatus: 'UNKNOWN',
                createdAt: new Date().toISOString()
            });

            setOpen(false);
            // alert(`Студент ${firstName} ${lastName} успешно создан`);

            // Reset form
            setFirstName("");
            setLastName("");
            setBirthDate("");
            setGroupId("");

            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Ошибка при создании студента");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить студента
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление студента</DialogTitle>
                    <DialogDescription>Выберите способ добавления нового ученика</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-950">
                        <TabsTrigger value="manual">Вручную</TabsTrigger>
                        <TabsTrigger value="qr">QR-код</TabsTrigger>
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
                            <Label>Дата рождения *</Label>
                            <Input
                                type="date"
                                className="bg-zinc-950 border-zinc-800"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Группа (опционально)</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите группу" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Без группы</SelectItem>
                                    {groups.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
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

                    {/* QR TAB */}
                    <TabsContent value="qr" className="py-4 space-y-4">
                        <div className="aspect-square bg-black rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                                <Camera className="h-12 w-12 text-zinc-500 mb-2" />
                            </div>
                            <p className="text-zinc-400 text-sm relative z-10">Камера отключена в Dev Mode</p>
                        </div>
                        <Button className="w-full gap-2" variant="secondary">
                            <QrCode className="h-4 w-4" />
                            Открыть сканер
                        </Button>
                    </TabsContent>

                    {/* INVITE TAB */}
                    <TabsContent value="invite" className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Email ученика</Label>
                            <Input placeholder="student@example.com" className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Или код приглашения</Label>
                            <div className="flex gap-2">
                                <Input value="S-8129-XJ" readOnly className="bg-zinc-950 border-zinc-800 font-mono text-center tracking-widest" />
                                <Button variant="outline" size="icon" title="Копировать">
                                    <span className="sr-only">Copy</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006V2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006L2.5 1.00006C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H12.5C13.3284 4.00006 14 4.67163 14 5.50006V12.5001C14 13.3285 13.3284 14.0001 12.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006C6.22386 5.00006 6 5.22392 6 5.50006V12.5001C6 12.7762 6.22386 13.0001 6.5 13.0001H12.5C12.7761 13.0001 13 12.7762 13 12.5001V5.50006C13 5.22392 12.7761 5.00006 12.5 5.00006H6.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </Button>
                            </div>
                        </div>
                        <Button className="w-full gap-2 mt-4" disabled>
                            <Mail className="h-4 w-4" />
                            Отправить приглашение
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
