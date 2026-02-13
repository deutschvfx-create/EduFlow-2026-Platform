'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, History, User } from "lucide-react";
import { attendanceRepo } from "@/lib/data/attendance.repo";
import { useOrganization } from "@/hooks/use-organization";
import { AttendanceRecord } from "@/lib/types/attendance";

interface StudentPersonalNoteProps {
    lessonId: string;
    studentId: string;
    studentName: string;
    initialNote?: string;
    onSave?: (note: string) => void;
}

export function StudentPersonalNote({
    lessonId,
    studentId,
    studentName,
    initialNote = "",
    onSave
}: StudentPersonalNoteProps) {
    const { currentOrganizationId } = useOrganization();
    const [note, setNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setNote(initialNote);
    }, [initialNote]);

    const handleSave = async () => {
        if (!currentOrganizationId) return;
        setIsSaving(true);

        try {
            // We need to fetch the current record or create a placeholder to save the note
            const records = await attendanceRepo.getAll(currentOrganizationId, undefined, { scheduleIds: [lessonId] });
            const existing = records.find(r => r.studentId === studentId);

            const record: AttendanceRecord = {
                id: existing?.id || `new-${Date.now()}-${studentId}`,
                organizationId: currentOrganizationId,
                scheduleId: lessonId,
                studentId: studentId,
                date: existing?.date || new Date().toISOString(),
                status: existing?.status || "UNKNOWN",
                note: note,
                updatedAt: new Date().toISOString()
            };

            await attendanceRepo.save(currentOrganizationId, record);
            if (onSave) onSave(note);
        } catch (error) {
            console.error("Failed to save personal note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                    <StickyNote className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Заметка о студенте: {studentName}</h4>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider">Приватный комментарий учителя</p>
                </div>
            </div>

            <div className="relative">
                <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Например: Студент сегодня был пассивен, нужно уделить внимание произношению..."
                    className="min-h-[150px] bg-amber-50/30 border-amber-100 focus-visible:ring-amber-500 rounded-2xl p-4 text-sm text-[hsl(var(--foreground))] resize-none"
                />
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-foreground rounded-xl h-9 px-4 font-bold text-xs gap-2 shadow-sm"
                >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "..." : "Сохранить"}
                </Button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white border border-amber-100 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase tracking-wider">История заметок</p>
                    <p className="text-xs text-amber-800 font-medium">Это примечание будет прикреплено к записи посещаемости за этот урок.</p>
                </div>
            </div>
        </div>
    );
}
