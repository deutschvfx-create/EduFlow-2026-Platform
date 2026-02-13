'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Faculty, FacultyStatus } from "@/lib/types/faculty";
import { Teacher } from "@/lib/types/teacher";
import { useOrganization } from "@/hooks/use-organization";

interface EditFacultyModalProps {
    faculty: Faculty | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Faculty>) => void;
}

export function EditFacultyModal({ faculty, open, onOpenChange, onSave }: EditFacultyModalProps) {
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [headTeacherId, setHeadTeacherId] = useState("");
    const [status, setStatus] = useState<FacultyStatus>("ACTIVE");

    useEffect(() => {
        if (faculty) {
            setName(faculty.name);
            setCode(faculty.code);
            setDescription(faculty.description || "");
            setHeadTeacherId(faculty.headTeacherId || "");
            setStatus(faculty.status);
        }

        if (open && currentOrganizationId) {
            import("@/lib/data/teachers.repo").then(async ({ teachersRepo }) => {
                const data = await teachersRepo.getAll(currentOrganizationId);
                setTeachers(data);
            });
        }
    }, [faculty, open, currentOrganizationId]);

    const handleSubmit = async () => {
        if (!faculty) return;
        if (!name || !code) {
            alert("Название и код обязательны");
            return;
        }

        setLoading(true);
        // Simulate minor delay for UX feedback
        await new Promise(r => setTimeout(r, 600));

        onSave(faculty.id, {
            name,
            code,
            description,
            headTeacherId: headTeacherId || undefined,
            status,
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!faculty) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Редактирование факультета</DialogTitle>
                    <DialogDescription>Изменение данных факультета {faculty.code}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Название *</Label>
                        <Input
                            className="bg-background border-border"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Код (ID) *</Label>
                        <Input
                            className="bg-background border-border uppercase"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={10}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            className="bg-background border-border resize-none h-20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Руководитель</Label>
                            <Select value={headTeacherId} onValueChange={setHeadTeacherId}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Не назначен" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.firstName} {t.lastName} ({t.specialization || "Преподаватель"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(s) => setStatus(s as FacultyStatus)}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Активен</SelectItem>
                                    <SelectItem value="INACTIVE">Неактивен</SelectItem>
                                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-foreground">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
