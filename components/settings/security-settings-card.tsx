"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, EyeOff, Save, ChevronDown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";

interface SecuritySettingsCardProps {
    onSave?: () => void;
}

export function SecuritySettingsCard({ onSave }: SecuritySettingsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!auth.currentUser) return;

        if (passwords.new.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setError("Пароли не совпадают");
            return;
        }

        setError(null);
        setSaving(true);
        try {
            await updatePassword(auth.currentUser, passwords.new);
            setPasswords({ new: "", confirm: "" });
            onSave?.();
            setIsExpanded(false);
        } catch (e: any) {
            console.error("Failed to update password:", e);
            if (e.code === 'auth/requires-recent-login') {
                setError("Для смены пароля требуется недавний вход в систему. Пожалуйста, перезайдите и попробуйте снова.");
            } else {
                setError("Ошибка при смене пароля. Попробуйте позже.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-zinc-950/50 border border-zinc-900 shadow-xl overflow-hidden">
            <CardContent className="p-6">
                {/* Header with Collapse Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between gap-3 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <ShieldCheck className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">
                                Безопасность
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Смена пароля и защита аккаунта
                            </p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                    </motion.div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 space-y-4 max-w-md">
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Новый пароль
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="••••••••"
                                            className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 text-white h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Подтвердите новый пароль
                                    </Label>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        placeholder="••••••••"
                                        className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 text-white h-11"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded flex items-center gap-2">
                                        <Lock className="h-3 w-3" />
                                        {error}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || !passwords.new || !passwords.confirm}
                                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider gap-2 shadow-lg shadow-amber-500/20 px-6"
                                    >
                                        {saving ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {saving ? 'Обновление...' : 'Обновить пароль'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
