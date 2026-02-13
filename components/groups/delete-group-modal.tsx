'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";

interface DeleteGroupModalProps {
    groupName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
}

export function DeleteGroupModal({ groupName, open, onOpenChange, onConfirm }: DeleteGroupModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-card border-none text-foreground p-0 overflow-hidden rounded-[28px] shadow-2xl font-inter">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-[22px] flex items-center justify-center mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-[22px] font-black text-[#0F172A] tracking-tight leading-tight">
                                Удалить группу?
                            </DialogTitle>
                            <DialogDescription className="text-[14px] font-medium text-[#64748B] leading-relaxed px-4">
                                Вы собираетесь полностью удалить группу <span className="font-bold text-[#0F172A]">"{groupName}"</span>. Это действие нельзя будет отменить.
                            </DialogDescription>
                        </div>

                        <div className="w-full flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-[20px] text-left mt-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            <p className="text-[12px] font-bold text-red-900 leading-tight">
                                Все связанные данные о студентах, посещаемости и расписании будут безвозвратно удалены.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-8">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="h-12 w-full bg-red-600 hover:bg-red-700 text-white text-[14px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Удалить навсегда"
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
