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
    QrCode,
    Link as LinkIcon,
    History,
    LogOut,
    Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { AccessManager } from "./security/access-manager";
import { compressImage } from "@/lib/utils";
import { UserData, UserService, OrganizationService } from "@/lib/services/firestore";
import { Slider } from "@/components/ui/slider";
import { auth, db } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";
import { useTheme } from "next-themes";
import { doc, onSnapshot } from "firebase/firestore";

interface UserProfileCardProps {
    onSave?: () => void;
}

export function UserProfileCard({ onSave }: UserProfileCardProps) {
    const { user, userData } = useAuth();

    // Collapse State
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Main UI State
    const [activeTab, setActiveTab] = useState<"profile" | "organization" | "security" | "access" | "interface">("profile");
    const [saving, setSaving] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure theme is only rendered on client
    useEffect(() => {
        setMounted(true);
    }, []);

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
        <Card className={`bg-background/30 border border-border/50 rounded-xl overflow-hidden mt-6 transition-all duration-300 ${isCollapsed ? 'mb-6' : ''}`}>
            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        key="collapsed"
                        className="flex items-center justify-between p-4 bg-card/20"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={formData.photoURL} className="object-cover" />
                                <AvatarFallback className="bg-card text-muted-foreground">
                                    {formData.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-foreground">
                                        {formData.firstName || "Пользователь"} {formData.lastName || ""}
                                    </h3>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        ONLINE
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapse}
                            className="text-muted-foreground hover:text-foreground"
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
                            <div className="flex items-center justify-between px-4 py-3 bg-card/20 border-b border-border/50">
                                <div className="flex items-center gap-1 bg-card/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "profile"
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
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
                                                    ? "bg-secondary text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
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
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Безопасность
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("access")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "access"
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                        Доступ
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("interface")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all
                                        ${activeTab === "interface"
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <Smartphone className="h-3.5 w-3.5" />
                                        Интерфейс
                                    </button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleCollapse}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-4">
                                {activeTab === "profile" && (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                            <div
                                                className="relative group cursor-move h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-card"
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
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <User className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-foreground"
                                                >
                                                    <Camera className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

                                            {formData.photoURL && (
                                                <div className="w-24 space-y-2">
                                                    <div className="flex items-center justify-between text-muted-foreground">
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
                                                        className="w-full text-[9px] text-muted-foreground hover:text-primary font-medium uppercase tracking-wider"
                                                    >
                                                        Сброс
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Имя</Label>
                                                    <Input
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Фамилия</Label>
                                                    <Input
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Email (ID)</Label>
                                                    <Input
                                                        value={userData?.email || ""}
                                                        disabled
                                                        className="h-9 bg-card/50 border-border text-xs text-muted-foreground"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Телефон</Label>
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+992..."
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Дата рождения</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.birthDate}
                                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs text-foreground"
                                                        style={{ colorScheme: 'dark' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    disabled={saving}
                                                    className="h-9 bg-white hover:bg-secondary text-black text-[10px] font-black uppercase tracking-wider px-6"
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
                                                className="relative group cursor-move h-24 w-24 rounded-xl overflow-hidden border-2 border-border bg-card"
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
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <Building2 className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => orgLogoInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-foreground"
                                                >
                                                    <Upload className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <input type="file" ref={orgLogoInputRef} className="hidden" accept="image/*" onChange={handleOrgLogoUpload} />

                                            {orgData.logo && (
                                                <div className="w-24 space-y-2">
                                                    <div className="flex items-center justify-between text-muted-foreground">
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
                                                        className="w-full text-[9px] text-muted-foreground hover:text-primary font-medium uppercase tracking-wider"
                                                    >
                                                        Сброс
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase text-muted-foreground">Название организации</Label>
                                                <Input
                                                    value={orgData.name}
                                                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                                    className="h-9 bg-card/30 border-border text-xs"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Тип</Label>
                                                    <select
                                                        value={orgData.type}
                                                        onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
                                                        className="w-full h-9 text-xs bg-card/30 border border-border rounded-md px-2 text-foreground outline-none"
                                                    >
                                                        <option value="university">🎓 Университет</option>
                                                        <option value="language_school">🌍 Языковая школа</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Год основания</Label>
                                                    <Input
                                                        type="number"
                                                        value={orgData.establishedYear}
                                                        onChange={(e) => setOrgData({ ...orgData, establishedYear: parseInt(e.target.value) })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Email</Label>
                                                    <Input
                                                        value={orgData.email}
                                                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Телефон</Label>
                                                    <Input
                                                        value={orgData.phone}
                                                        onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Веб-сайт</Label>
                                                    <Input
                                                        value={orgData.website}
                                                        onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Адрес</Label>
                                                    <Input
                                                        value={orgData.address}
                                                        onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                                                        className="h-9 bg-card/30 border-border text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-end">
                                                <Button
                                                    onClick={handleSaveOrganization}
                                                    disabled={saving}
                                                    className="h-9 bg-primary hover:bg-primary text-foreground text-[10px] font-black uppercase tracking-wider px-6"
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
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Новый пароль</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="h-9 bg-card/30 border-border text-xs pr-8"
                                                />
                                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground">Подтвердите пароль</Label>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                placeholder="••••••••"
                                                className="h-9 bg-card/30 border-border text-xs"
                                            />
                                        </div>
                                        {securityError && <p className="text-[9px] font-bold text-red-400 flex items-center gap-1"><Lock className="h-3 w-3" />{securityError}</p>}
                                        <div className="flex justify-center pt-2">
                                            <Button
                                                onClick={handleSavePassword}
                                                disabled={saving || !passwords.new}
                                                className="h-9 bg-amber-600 hover:bg-amber-500 text-foreground text-[10px] font-black uppercase tracking-wider px-6"
                                            >
                                                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Обновить пароль
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "access" && (
                                    <AccessManager />
                                )}

                                {activeTab === "interface" && mounted && (
                                    <div className="space-y-6 py-2">
                                        <div className="flex items-center gap-3 px-2 mb-4">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest italic">
                                                Оформление интерфейса
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'light', label: 'Светлая', icon: Eye, color: 'text-amber-500', desc: 'Максимум яркости' },
                                                { id: 'dark', label: 'Тёмная', icon: EyeOff, color: 'text-primary', desc: 'Комфорт для глаз' },
                                                { id: 'system', label: 'Системная', icon: Monitor, color: 'text-emerald-500', desc: 'Как в Windows' }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={`relative flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group
                                                        ${theme === t.id
                                                            ? 'bg-card border-primary/50 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                                                            : 'bg-background/40 border-border hover:bg-card hover:border-border'
                                                        }`}
                                                >
                                                    <div className={`p-4 rounded-full transition-colors ${theme === t.id ? 'bg-primary/20 ' + t.color : 'bg-secondary/50 text-muted-foreground'}`}>
                                                        <t.icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xs font-black uppercase tracking-wider ${theme === t.id ? 'text-white' : 'text-muted-foreground'}`}>
                                                            {t.label}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium group-hover:text-muted-foreground transition-colors">
                                                            {t.desc}
                                                        </p>
                                                    </div>
                                                    {theme === t.id && (
                                                        <div className="absolute top-3 right-3">
                                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-cyan-500/40">
                                                                <Check className="h-3 w-3 text-foreground" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-8 p-4 rounded-xl bg-card/40 border border-border/50">
                                            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.15em] font-medium leading-relaxed">
                                                Переключайте тему в зависимости от времени суток и освещения. <br />
                                                <span className="text-primary/80">Ваша настройка сохранится автоматически.</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
