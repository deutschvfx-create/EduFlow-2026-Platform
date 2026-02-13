"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Building2, GraduationCap, Laptop, Loader2, Sparkles } from "lucide-react";
import { OrganizationService } from "@/lib/services/firestore";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { motion, AnimatePresence } from "framer-motion";

interface CreateOrgModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateOrgModal({ open, onOpenChange }: CreateOrgModalProps) {
    const { user } = useAuth();
    const { switchOrganization } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("Courses");

    const handleCreate = async () => {
        if (!user || !name) return;
        setLoading(true);
        try {
            const orgId = await OrganizationService.createNewOrganization(user.uid, {
                name,
                type
            });

            if (orgId) {
                // Success! Close modal and switch to the new org
                onOpenChange(false);
                switchOrganization(orgId);
            }
        } catch (error) {
            console.error("Failed to create organization:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white/80 backdrop-blur-2xl border-white/20 rounded-[32px] shadow-2xl">
                <div className="relative p-8 space-y-8">
                    {/* Header Decor */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Sparkles className="h-24 w-24 text-primary" />
                    </div>

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black text-[#0F3D4C] tracking-tight">
                            Создать <span className="text-primary italic">Свою Школу</span>
                        </DialogTitle>
                        <DialogDescription className="text-[#0F3D4C]/60 text-base pt-2">
                            Запустите свою образовательную платформу за несколько секунд.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D4C]/40 ml-1">
                                Название организации
                            </Label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Напр: Oxford English Central"
                                    className="h-14 pl-12 bg-white/50 border-[#DDE7EA] focus:border-primary focus:ring-primary/20 rounded-2xl font-bold text-[#0F3D4C] transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D4C]/40 ml-1">
                                Тип обучения
                            </Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-14 bg-white/50 border-[#DDE7EA] focus:border-primary focus:ring-primary/20 rounded-2xl font-bold text-[#0F3D4C] transition-all">
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#DDE7EA] rounded-2xl shadow-xl p-2">
                                    <SelectItem value="School" className="rounded-xl py-3 focus:bg-primary/5">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <span className="font-bold">Общая школа</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="University" className="rounded-xl py-3 focus:bg-primary/5">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            <span className="font-bold">Университет / Колледж</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Courses" className="rounded-xl py-3 focus:bg-primary/5">
                                        <div className="flex items-center gap-2">
                                            <Laptop className="h-4 w-4 text-primary" />
                                            <span className="font-bold">Курсы / Языковая школа</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="relative z-10 pt-4">
                        <Button
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 transition-all group"
                            onClick={handleCreate}
                            disabled={loading || !name}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Запустить платформу</span>
                                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
