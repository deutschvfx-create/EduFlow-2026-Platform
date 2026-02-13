'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteTeacherModalProps {
    teacherName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
}

export function DeleteTeacherModal({ teacherName, open, onOpenChange, onConfirm }: DeleteTeacherModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error("Deletion failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white border-none text-[#0F172A] p-0 overflow-hidden rounded-[28px] shadow-2xl font-inter">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-[22px] flex items-center justify-center mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-[20px] font-black text-[#0F172A] tracking-tight leading-tight">
                                Удалить безвозвратно?
                            </DialogTitle>
                            <DialogDescription className="text-[14px] font-medium text-[#64748B] leading-relaxed px-4">
                                Вы собираетесь полностью удалить преподавателя <span className="font-bold text-[#0F172A]">"{teacherName}"</span> из системы.
                            </DialogDescription>
                        </div>

                        <div className="w-full flex items-start gap-3 p-4 bg-red-50 border border-red-100/50 rounded-[20px] text-left mt-2">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] font-medium text-red-700 leading-tight">
                                Это действие невозможно отменить. Все связанные данные профиля будут стерты навсегда.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-8">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="h-12 w-full bg-[#EF4444] hover:bg-[#DC2626] text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Удалить преподавателя"
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
