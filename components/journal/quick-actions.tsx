'use client';

import { Button } from "@/components/ui/button";
import { Check, Undo2, XCircle, RotateCcw } from "lucide-react";

interface SmartJournalQuickActionsProps {
    onMarkAllPresent: () => void;
    onReset: () => void;
    onUndo: () => void;
}

export function SmartJournalQuickActions({
    onMarkAllPresent,
    onReset,
    onUndo
}: SmartJournalQuickActionsProps) {
    return (
        <div className="flex items-center gap-3">
            <Button
                onClick={onMarkAllPresent}
                className="h-12 px-6 bg-[#22C55E] hover:bg-[#16A34A] text-foreground font-bold rounded-xl text-sm gap-2 shadow-sm"
            >
                {/* CheckAll as icon replacement if lucide doesn't have it, using Check */}
                <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /><path d="m12 6 7 7-3 3" /></svg>
                    Все присутствуют
                </span>
            </Button>

            <Button
                variant="outline"
                onClick={onReset}
                className="h-12 px-6 bg-white border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] font-bold rounded-xl text-sm gap-2"
            >
                <RotateCcw className="h-4 w-4" />
                Сбросить
            </Button>

            <Button
                variant="ghost"
                onClick={onUndo}
                className="h-12 px-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] font-bold rounded-xl text-sm gap-2"
            >
                <Undo2 className="h-4 w-4" />
                Отменить
            </Button>
        </div>
    );
}
