"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    User,
    Save,
    ChevronDown,
    Camera,
    Check,
    Upload,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Move,
    ZoomIn,
    ZoomOut,
    RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { UserData, UserService } from "@/lib/services/firestore";
import { Slider } from "@/components/ui/slider";
import { auth } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";

interface UserProfileCardProps {
    onSave?: () => void;
}

export function UserProfileCard({ onSave }: UserProfileCardProps) {
    const { user, userData } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<UserData>>({
        firstName: "",
        lastName: "",
        birthDate: "",
        photoURL: "",
        photoScale: 1,
        photoPosition: { x: 0, y: 0 }
    });

    // Password state
    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [securityError, setSecurityError] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                birthDate: userData.birthDate || "",
                photoURL: userData.photoURL || "",
                photoScale: userData.photoScale || 1,
                photoPosition: userData.photoPosition || { x: 0, y: 0 }
            });
        }
    }, [userData]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await UserService.updateUser(user.uid, formData);
            onSave?.();
        } catch (e) {
            console.error("Failed to save profile:", e);
            alert("Ошибка при сохранении профиля");
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (!auth.currentUser) return;

        if (passwords.new.length < 6) {
            setSecurityError("Пароль должен содержать минимум 6 символов");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setSecurityError("Пароли не совпадают");
            return;
        }

        setSecurityError(null);
        setSaving(true);
        try {
            await updatePassword(auth.currentUser, passwords.new);
            setPasswords({ new: "", confirm: "" });
            onSave?.();
            alert("Пароль успешно обновлен");
        } catch (e: any) {
            console.error("Failed to update password:", e);
            if (e.code === 'auth/requires-recent-login') {
                setSecurityError("Требуется недавний вход. Перезайдите в систему.");
            } else {
                setSecurityError("Ошибка при смене пароля");
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    photoURL: event.target?.result as string,
                    photoScale: 1,
                    photoPosition: { x: 0, y: 0 }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && formData.photoURL) {
            setFormData(prev => ({
                ...prev,
                photoPosition: {
                    x: (prev.photoPosition?.x || 0) + e.movementX,
                    y: (prev.photoPosition?.y || 0) + e.movementY
                }
            }));
        }
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <Card className="bg-zinc-950/50 border border-zinc-900 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
                {/* Header Section */}
                <div className="p-6 border-b border-zinc-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <User className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Настройки профиля</h2>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
                                    {userData?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-zinc-500 hover:text-white"
                        >
                            <motion.div animate={{ rotate: isExpanded ? 0 : 180 }}>
                                <ChevronDown className="h-5 w-5" />
                            </motion.div>
                        </Button>
                    </div>

                    {/* Compact Tabs */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2 mt-6 bg-zinc-900/50 p-1 rounded-xl w-fit"
                            >
                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "profile"
                                        ? "bg-zinc-800 text-white shadow-lg"
                                        : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Профиль
                                </button>
                                <button
                                    onClick={() => setActiveTab("security")}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "security"
                                        ? "bg-zinc-800 text-white shadow-lg"
                                        : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Безопасность
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Section */}
                <AnimatePresence mode="wait">
                    {isExpanded && (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            {activeTab === "profile" ? (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left: WhatsApp-style Photo Editor */}
                                    <div className="lg:col-span-4 flex flex-col items-center gap-6">
                                        <div
                                            className="relative group cursor-move"
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                        >
                                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-900 flex items-center justify-center shadow-2xl relative">
                                                {formData.photoURL ? (
                                                    <motion.img
                                                        src={formData.photoURL}
                                                        alt="Profile"
                                                        className="absolute w-full h-full object-cover pointer-events-none"
                                                        style={{
                                                            scale: formData.photoScale,
                                                            x: formData.photoPosition?.x,
                                                            y: formData.photoPosition?.y,
                                                            cursor: isDragging ? 'grabbing' : 'grab'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center text-zinc-600">
                                                        <User className="w-16 h-16 mb-2" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Нет фото</span>
                                                    </div>
                                                )}

                                                {/* Drag Overlay hint */}
                                                {formData.photoURL && (
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                        <Move className="text-white w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Camera Trigger */}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-2 right-2 h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center border-4 border-zinc-950"
                                            >
                                                <Camera className="h-5 w-5" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                            />
                                        </div>

                                        {/* Scale Slider */}
                                        {formData.photoURL && (
                                            <div className="w-full max-w-[200px] space-y-4">
                                                <div className="flex items-center justify-between text-zinc-500">
                                                    <ZoomOut className="h-4 w-4" />
                                                    <Slider
                                                        value={[formData.photoScale || 1]}
                                                        min={0.5}
                                                        max={3}
                                                        step={0.1}
                                                        onValueChange={([val]) => setFormData(prev => ({ ...prev, photoScale: val }))}
                                                        className="mx-3"
                                                    />
                                                    <ZoomIn className="h-4 w-4" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, photoScale: 1, photoPosition: { x: 0, y: 0 } }))}
                                                    className="w-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-400"
                                                >
                                                    <RefreshCcw className="h-3 w-3 mr-2" /> Сбросить позицию
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Personal Info Form */}
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Имя</Label>
                                                <Input
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    placeholder="Введите имя"
                                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Фамилия</Label>
                                                <Input
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    placeholder="Введите фамилию"
                                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Дата рождения</Label>
                                            <Input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 h-12 rounded-xl text-white"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider px-8 h-12 rounded-xl gap-2 shadow-xl"
                                            >
                                                {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                Сохранить профиль
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md space-y-6 mx-auto py-4">
                                    <div className="flex flex-col items-center gap-4 mb-8">
                                        <div className="h-16 w-16 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <ShieldCheck className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">Изменение пароля</h3>
                                        <p className="text-sm text-zinc-500 text-center">
                                            Для обеспечения безопасности вашего аккаунта используйте сложный пароль.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 relative">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Новый пароль</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500/50 h-12 rounded-xl pr-12"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Подтвердите пароль</Label>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                placeholder="••••••••"
                                                className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500/50 h-12 rounded-xl"
                                            />
                                        </div>

                                        {securityError && (
                                            <motion.p
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"
                                            >
                                                <Lock className="h-3.5 w-3.5" />
                                                {securityError}
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <Button
                                            onClick={handleSavePassword}
                                            disabled={saving || !passwords.new}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest px-10 h-12 rounded-xl gap-2 shadow-xl shadow-amber-500/20"
                                        >
                                            {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                            Обновить пароль
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
