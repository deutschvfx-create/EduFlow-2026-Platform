'use client';

import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Trash2, Users } from "lucide-react";

interface TeacherControlToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkAction: (action: string) => void;
}

export function TeacherControlToolbar({ selectedCount, onClearSelection, onBulkAction }: TeacherControlToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 px-4 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                <span className="text-sm font-medium text-white">{selectedCount} выбрано</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-white" onClick={onClearSelection}>
                    Сбросить
                </Button>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => onBulkAction('assign_groups')}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Группы
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                    onClick={() => onBulkAction('suspend')}
                >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Блок
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    onClick={() => onBulkAction('activate')}
                >
                    <Shield className="h-4 w-4 mr-2" />
                    Активировать
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => onBulkAction('delete')}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
