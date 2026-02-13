'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Loader2, AlertTriangle } from "lucide-react";
import { Group } from "@/lib/types/group";

interface ArchiveGroupModalProps {
    group: Group | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchive: (groupId: string, reason: string, notes?: string) => void;
}

export function ArchiveGroupModal({ group, open, onOpenChange, onArchive }: ArchiveGroupModalProps) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState<string>("COMPLETED");
    const [notes, setNotes] = useState("");

    const handleArchive = async () => {
        if (!group) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        onArchive(group.id, reason, notes);
        setLoading(false);
        onOpenChange(false);
        setReason("COMPLETED");
        setNotes("");
    };

    if (!group) return null;

    const archiveReasons = {
        COMPLETED: "Обучение завершено",
        INSUFFICIENT_STUDENTS: "Недостаточно студентов",
        STAFFING_ISSUES: "Проблемы с кадрами",
        RESTRUCTURED: "Реструктуризация",
        OTHER: "Другая причина"
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white border-none text-[#0F172A] p-0 overflow-hidden rounded-[28px] shadow-2xl font-inter">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-2 text-[22px] font-black tracking-tight">
                            <Archive className="h-6 w-6 text-amber-500" />
                            Архивация группы
                        </DialogTitle>
                        <DialogDescription className="text-[14px] font-medium text-[#64748B]">
                            Вы собираетесь архивировать группу <span className="font-bold text-[#0F172A]">{group.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-[20px]">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-900 mb-1 text-[13px]">Важно!</p>
                                <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed">
                                    Архивированная группа будет скрыта из активного поиска. Статус изменится на «Архив», но все данные студентов сохранятся.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-wider ml-1">
                                Причина архивации *
                            </Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger className="h-11 bg-[#F8FAFC] border-[#E2E8F0] rounded-[14px] text-[13px] font-medium focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                    {Object.entries(archiveReasons).map(([key, label]) => (
                                        <SelectItem key={key} value={key} className="text-[13px] font-medium py-2.5">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-wider ml-1">
                                Дополнительные заметки
                            </Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-[#F8FAFC] border-[#E2E8F0] rounded-[14px] resize-none h-24 text-[13px] font-medium focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-8">
                        <Button
                            onClick={handleArchive}
                            disabled={loading}
                            className="h-12 w-full bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Архивировать группу"
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-10 text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-transparent transition-colors"
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
