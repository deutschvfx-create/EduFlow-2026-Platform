"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, User, Save, ChevronDown, Camera, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { UserService, UserData } from "@/lib/services/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileCardProps {
    onSave?: () => void;
}

export function UserProfileCard({ onSave }: UserProfileCardProps) {
    const { user, userData } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<UserData>>({
        firstName: "",
        lastName: "",
        birthDate: "",
        photoURL: ""
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                birthDate: userData.birthDate || "",
                photoURL: userData.photoURL || ""
            });
        }
    }, [userData]);

    const handlePhotoUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, загрузите изображение');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Размер файла не должен превышать 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setFormData(prev => ({ ...prev, photoURL: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await UserService.updateUser(user.uid, formData);
            onSave?.();
            // Show local success state if needed
        } catch (e) {
            console.error("Failed to save profile:", e);
            alert("Ошибка при сохранении профиля");
        } finally {
            setSaving(false);
        }
    };

    const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || user?.email?.[0].toUpperCase() || "?";

    return (
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
            <CardContent className="p-6">
                {/* Header with Collapse Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between gap-3 mb-4 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <User className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                Личный Профиль
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Управление персональными данными и аватаром
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
                            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-8 pt-4">
                                {/* Photo Upload Section */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <Avatar className="h-32 w-32 border-4 border-zinc-900 ring-2 ring-indigo-500/30 shadow-2xl">
                                            <AvatarImage src={formData.photoURL} />
                                            <AvatarFallback className="bg-zinc-800 text-3xl font-black text-indigo-400">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 h-10 w-10 bg-indigo-600 hover:bg-indigo-500 rounded-full border-4 border-zinc-950 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handlePhotoUpload(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest font-bold">
                                        Нажмите на камеру, чтобы <br /> обновить фото
                                    </p>
                                </div>

                                {/* Personal Info Form */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Имя
                                            </Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                placeholder="Иван"
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 text-white h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Фамилия
                                            </Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                placeholder="Иванов"
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 text-white h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Дата рождения
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 text-white h-11 [color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Email (только чтение)
                                            </Label>
                                            <Input
                                                value={user?.email || ""}
                                                disabled
                                                className="bg-zinc-950 border-zinc-800 text-zinc-500 h-11 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-800/50">
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full sm:w-auto px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            {saving ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Check className="h-5 w-5" />
                                            )}
                                            {saving ? 'Сохранение...' : 'Сохранить изменения'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
