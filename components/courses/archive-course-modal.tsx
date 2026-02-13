'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Loader2, AlertTriangle } from "lucide-react";
import { Course } from "@/lib/types/course";

interface ArchiveCourseModalProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchive: (courseId: string, reason: string, notes?: string) => void;
}

export function ArchiveCourseModal({ course, open, onOpenChange, onArchive }: ArchiveCourseModalProps) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState<string>("CURRICULUM_CHANGE");
    const [notes, setNotes] = useState("");

    const handleArchive = async () => {
        if (!course) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        onArchive(course.id, reason, notes);
        setLoading(false);
        onOpenChange(false);
        setReason("CURRICULUM_CHANGE");
        setNotes("");
    };

    if (!course) return null;

    const archiveReasons = {
        CURRICULUM_CHANGE: "Изменение учебного плана",
        LOW_DEMAND: "Низкий спрос",
        OUTDATED: "Устаревший материал",
        MERGED: "Объединен с другим курсом",
        TEMPORARY: "Временная приостановка",
        OTHER: "Другая причина"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-amber-400" />
                        Архивация предмета
                    </DialogTitle>
                    <DialogDescription>
                        Вы собираетесь архивировать предмет <span className="font-semibold text-foreground">{course.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[20px]">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold text-amber-900 mb-1 text-[13px]">Важно!</p>
                            <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed">
                                Архивированный предмет будет скрыт из активного списка, но все данные сохранятся.
                                Вы сможете восстановить его позже.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                            Причина архивации *
                        </Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(archiveReasons).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                            Дополнительные заметки
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-background border-border resize-none h-20"
                            placeholder="Укажите дополнительную информацию (опционально)..."
                        />
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Версия: <span className="text-muted-foreground font-mono">{course.version}</span></p>
                        <p>• Дата создания: <span className="text-muted-foreground">{new Date(course.createdAt).toLocaleDateString('ru-RU')}</span></p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleArchive}
                        disabled={loading}
                        className="h-10 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Archive className="h-4 w-4" />
                        Архивировать
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
