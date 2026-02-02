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
    RefreshCcw,
    Building2,
    Calendar,
    Mail,
    Phone,
    Globe,
    MapPin,
    Minimize2,
    Maximize2,
    Monitor,
    Smartphone,
    Qty,
    QrCode,
    Link as LinkIcon,
    History,
    LogOut,
    Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { compressImage } from "@/lib/utils";
import { UserData, UserService, OrganizationService } from "@/lib/services/firestore";
import { Slider } from "@/components/ui/slider";
import { auth, db } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

interface UserProfileCardProps {
    onSave?: () => void;
}

export function UserProfileCard({ onSave }: UserProfileCardProps) {
    const { user, userData } = useAuth();

    // Collapse State
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Main UI State
    const [activeTab, setActiveTab] = useState<"profile" | "organization" | "security" | "access">("profile");
    const [saving, setSaving] = useState(false);

    // Load collapse preference
    useEffect(() => {
        const stored = localStorage.getItem("user-profile-collapsed");
        if (stored) setIsCollapsed(JSON.parse(stored));
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("user-profile-collapsed", JSON.stringify(newState));
    };

    // User Profile Form state
    const [formData, setFormData] = useState<Partial<UserData>>({
        firstName: "",
        lastName: "",
        birthDate: "",
        phone: "",
        photoURL: "",
        photoScale: 1,
        photoPosition: { x: 0, y: 0 }
    });

    // Organization Form state
    const [orgData, setOrgData] = useState<any>({
        name: "",
        type: "university",
        logo: "",
        logoScale: 1,
        logoPosition: { x: 50, y: 50 },
        address: "",
        phone: "",
        email: "",
        website: "",
        establishedYear: ""
    });

    // Password state
    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [securityError, setSecurityError] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingOrgLogo, setIsDraggingOrgLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const orgLogoInputRef = useRef<HTMLInputElement>(null);

    // Initial load for User Profile
    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                birthDate: userData.birthDate || "",
                phone: userData.phone || "",
                photoURL: userData.photoURL || "",
                photoScale: userData.photoScale || 1,
                photoPosition: userData.photoPosition || { x: 0, y: 0 }
            });

            // If owner and have orgId, subscribe to org data
            let unsubscribeOrg: (() => void) | null = null;
            if (userData.role === 'owner' && userData.organizationId && db) {
                unsubscribeOrg = onSnapshot(doc(db, "organizations", userData.organizationId), (doc) => {
                    if (doc.exists()) {
                        setOrgData(doc.data());
                    }
                }, (error) => {
                    console.error("Failed to subscribe to org data:", error);
                });
            }
            return () => {
                if (unsubscribeOrg) unsubscribeOrg();
            };
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
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOrganization = async () => {
        if (!userData?.organizationId) return;
        setSaving(true);
        try {
            await OrganizationService.updateOrganization(userData.organizationId, orgData);
            onSave?.();
        } catch (e) {
            console.error("Failed to save organization:", e);
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
        } catch (e: any) {
            console.error("Failed to update password:", e);
            if (e.code === 'auth/requires-recent-login') {
                setSecurityError("Требуется недавний вход. Перезайдите в систему.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Compress image to avoid Firestore 1MB limit
                const compressedImage = await compressImage(file, 800, 0.7);
                setFormData(prev => ({
                    ...prev,
                    photoURL: compressedImage,
                    photoScale: 1,
                    photoPosition: { x: 0, y: 0 }
                }));
            } catch (error) {
                console.error("Failed to compress image:", error);
                // Fallback to raw (risky but better than nothing if compression fails context)
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
        }
    };

    const handleOrgLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedImage = await compressImage(file, 800, 0.7);
                setOrgData((prev: any) => ({
                    ...prev,
                    logo: compressedImage,
                    logoScale: 1,
                    logoPosition: { x: 50, y: 50 }
                }));
            } catch (error) {
                console.error("Failed to compress logo:", error);
                const reader = new FileReader();
                reader.onload = (event) => {
                    setOrgData((prev: any) => ({
                        ...prev,
                        logo: event.target?.result as string,
                        logoScale: 1,
                        logoPosition: { x: 50, y: 50 }
                    }));
                };
                reader.readAsDataURL(file);
            }
        }
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
        if (isDraggingOrgLogo && orgData.logo) {
            setOrgData((prev: any) => ({
                ...prev,
                logoPosition: {
                    x: Math.min(100, Math.max(0, (prev.logoPosition?.x || 50) + (e.movementX / 2))),
                    y: Math.min(100, Math.max(0, (prev.logoPosition?.y || 50) + (e.movementY / 2)))
                }
            }));
        }
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
            setIsDraggingOrgLogo(false);
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const isOwner = userData?.role === 'owner';

    return (
        <Card className={`bg-zinc-950/30 border border-zinc-900/50 rounded-xl overflow-hidden mt-6 transition-all duration-300 ${isCollapsed ? 'mb-6' : ''}`}>
            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        key="collapsed"
                        className="flex items-center justify-between p-4 bg-zinc-900/20"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-zinc-800">
                                <AvatarImage src={formData.photoURL} className="object-cover" />
                                <AvatarFallback className="bg-zinc-900 text-zinc-400">
                                    {formData.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white">
                                        {formData.firstName || "Пользователь"} {formData.lastName || ""}
                                    </h3>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        ONLINE
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapse}
                            className="text-zinc-500 hover:text-white"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="expanded"
                    >
                        <CardContent className="p-0">
                            {/* Compact Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20 border-b border-zinc-900/50">
                                <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "profile"
                                                ? "bg-zinc-800 text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <User className="h-3.5 w-3.5" />
                                        Профиль
                                    </button>
                                    {isOwner && (
                                        <button
                                            onClick={() => setActiveTab("organization")}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                            ${activeTab === "organization"
                                                    ? "bg-zinc-800 text-white shadow-sm"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                        >
                                            <Building2 className="h-3.5 w-3.5" />
                                            Организация
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setActiveTab("security")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "security"
                                                ? "bg-zinc-800 text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Безопасность
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("access")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "access"
                                                ? "bg-zinc-800 text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                        Доступ
                                    </button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleCollapse}
                                    className="h-8 w-8 text-zinc-500 hover:text-white"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-4">
                                {activeTab === "profile" && (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                            <div
                                                className="relative group cursor-move h-24 w-24 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-900"
                                                onMouseDown={() => setIsDragging(true)}
                                                onMouseMove={handleMouseMove}
                                            >
                                                {formData.photoURL ? (
                                                    <motion.img
                                                        src={formData.photoURL}
                                                        alt="Profile"
                                                        className="absolute w-full h-full object-cover pointer-events-none"
                                                        style={{
                                                            scale: formData.photoScale,
                                                            x: formData.photoPosition?.x,
                                                            y: formData.photoPosition?.y
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-zinc-600">
                                                        <User className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                    <Camera className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

                                            {formData.photoURL && (
                                                <div className="w-24 space-y-2">
                                                    <div className="flex items-center justify-between text-zinc-500">
                                                        <ZoomOut className="h-3 w-3" />
                                                        <Slider
                                                            value={[formData.photoScale || 1]}
                                                            min={0.5}
                                                            max={3}
                                                            step={0.1}
                                                            onValueChange={([val]) => setFormData(prev => ({ ...prev, photoScale: val }))}
                                                            className="mx-2 h-2"
                                                        />
                                                        <ZoomIn className="h-3 w-3" />
                                                    </div>
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, photoScale: 1, photoPosition: { x: 0, y: 0 } }))}
                                                        className="w-full text-[9px] text-zinc-500 hover:text-indigo-400 font-medium uppercase tracking-wider"
                                                    >
                                                        Сброс
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Имя</Label>
                                                    <Input
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Фамилия</Label>
                                                    <Input
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Email (ID)</Label>
                                                    <Input
                                                        value={userData?.email || ""}
                                                        disabled
                                                        className="h-9 bg-zinc-900/50 border-zinc-900 text-xs text-zinc-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Телефон</Label>
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+992..."
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Дата рождения</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.birthDate}
                                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs text-zinc-300"
                                                        style={{ colorScheme: 'dark' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    disabled={saving}
                                                    className="h-9 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-wider px-6"
                                                >
                                                    {saving ? <RefreshCcw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                                    Сохранить
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "organization" && (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                            <div
                                                className="relative group cursor-move h-24 w-24 rounded-xl overflow-hidden border-2 border-zinc-800 bg-zinc-900"
                                                onMouseDown={() => setIsDraggingOrgLogo(true)}
                                                onMouseMove={handleMouseMove}
                                            >
                                                {orgData.logo ? (
                                                    <motion.img
                                                        src={orgData.logo}
                                                        alt="Org Logo"
                                                        className="absolute w-full h-full object-contain pointer-events-none"
                                                        style={{ scale: orgData.logoScale, objectPosition: `${orgData.logoPosition?.x}% ${orgData.logoPosition?.y}%` }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-zinc-600">
                                                        <Building2 className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => orgLogoInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                    <Upload className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <input type="file" ref={orgLogoInputRef} className="hidden" accept="image/*" onChange={handleOrgLogoUpload} />

                                            {orgData.logo && (
                                                <div className="w-24 space-y-2">
                                                    <div className="flex items-center justify-between text-zinc-500">
                                                        <ZoomOut className="h-3 w-3" />
                                                        <Slider
                                                            value={[orgData.logoScale || 1]}
                                                            min={0.5}
                                                            max={3}
                                                            step={0.1}
                                                            onValueChange={([val]) => setOrgData((prev: any) => ({ ...prev, logoScale: val }))}
                                                            className="mx-2 h-2"
                                                        />
                                                        <ZoomIn className="h-3 w-3" />
                                                    </div>
                                                    <button
                                                        onClick={() => setOrgData((prev: any) => ({ ...prev, logoScale: 1, logoPosition: { x: 50, y: 50 } }))}
                                                        className="w-full text-[9px] text-zinc-500 hover:text-indigo-400 font-medium uppercase tracking-wider"
                                                    >
                                                        Сброс
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-500">Название организации</Label>
                                                <Input
                                                    value={orgData.name}
                                                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                                    className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Тип</Label>
                                                    <select
                                                        value={orgData.type}
                                                        onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
                                                        className="w-full h-9 text-xs bg-zinc-900/30 border border-zinc-900 rounded-md px-2 text-zinc-300 outline-none"
                                                    >
                                                        <option value="university">🎓 Университет</option>
                                                        <option value="language_school">🌍 Языковая школа</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Год основания</Label>
                                                    <Input
                                                        type="number"
                                                        value={orgData.establishedYear}
                                                        onChange={(e) => setOrgData({ ...orgData, establishedYear: parseInt(e.target.value) })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Email</Label>
                                                    <Input
                                                        value={orgData.email}
                                                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Телефон</Label>
                                                    <Input
                                                        value={orgData.phone}
                                                        onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Веб-сайт</Label>
                                                    <Input
                                                        value={orgData.website}
                                                        onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[9px] font-bold uppercase text-zinc-500">Адрес</Label>
                                                    <Input
                                                        value={orgData.address}
                                                        onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                                                        className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    onClick={handleSaveOrganization}
                                                    disabled={saving}
                                                    className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-6"
                                                >
                                                    <Save className="h-3.5 w-3.5 mr-2" /> Сохранить
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "security" && (
                                    <div className="max-w-sm mx-auto space-y-4">
                                        <div className="space-y-1 relative">
                                            <Label className="text-[9px] font-bold uppercase text-zinc-500">Новый пароль</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="h-9 bg-zinc-900/30 border-zinc-900 text-xs pr-8"
                                                />
                                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase text-zinc-500">Подтвердите пароль</Label>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                placeholder="••••••••"
                                                className="h-9 bg-zinc-900/30 border-zinc-900 text-xs"
                                            />
                                        </div>
                                        {securityError && <p className="text-[9px] font-bold text-red-400 flex items-center gap-1"><Lock className="h-3 w-3" />{securityError}</p>}
                                        <div className="flex justify-center pt-2">
                                            <Button
                                                onClick={handleSavePassword}
                                                disabled={saving || !passwords.new}
                                                className="h-9 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-6"
                                            >
                                                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Обновить пароль
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "access" && (
                                    <AccessManager />
                                )}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
