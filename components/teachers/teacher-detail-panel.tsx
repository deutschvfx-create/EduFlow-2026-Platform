"use client";

import { useEffect, useState, useRef } from "react";
import { Teacher, TeacherRole, TeacherStatus } from "@/lib/types/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassportPhotoEditor } from "@/components/students/passport-photo-editor";
import { useOrganization } from "@/hooks/use-organization";
import { Save, User, Shield, Users, Calendar, Trash2, Undo2, Archive, Loader2, Info, Camera, RotateCcw, AlertTriangle, ShieldCheck, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeacherPassportModal } from "./teacher-passport";

interface TeacherDetailPanelProps {
    teacher: Teacher;
    onAction: (action: string, id: string, data?: any) => Promise<void>;
    onPreviewChange?: (teacher: Partial<Teacher>) => void;
}

export function TeacherDetailPanel({ teacher, onAction, onPreviewChange }: TeacherDetailPanelProps) {
    const { currentOrganizationId } = useOrganization();

    // Mock Toast matching other components
    const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) };

    const [isLoading, setIsLoading] = useState(false);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Form State
    const [formData, setFormData] = useState({
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        specialization: teacher.specialization || "",
        birthDate: teacher.birthDate || "",
        gender: teacher.gender || "",
        address: teacher.address || "",
        citizenship: teacher.citizenship || "",
        nativeLanguage: teacher.nativeLanguage || "",
        role: teacher.role,
        status: teacher.status,
        permissions: teacher.permissions,
        notes: teacher.notes || "",
        passportPhotoUrl: teacher.passportPhotoUrl || "",
        publicSettings: teacher.publicSettings || {
            showPhoto: true,
            showContacts: false
        }
    });

    const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

    // Notify parent of changes for real-time preview
    useEffect(() => {
        if (!onPreviewChange) return;
        onPreviewChange({
            firstName: formData.firstName,
            lastName: formData.lastName,
            specialization: formData.specialization,
            role: formData.role,
            status: formData.status,
            passportPhotoUrl: formData.passportPhotoUrl
        });
    }, [formData, onPreviewChange]);

    useEffect(() => {
        setFormData({
            firstName: teacher.firstName || "",
            lastName: teacher.lastName || "",
            email: teacher.email || "",
            phone: teacher.phone || "",
            specialization: teacher.specialization || "",
            birthDate: teacher.birthDate || "",
            gender: teacher.gender || "",
            address: teacher.address || "",
            citizenship: teacher.citizenship || "",
            nativeLanguage: teacher.nativeLanguage || "",
            role: teacher.role,
            status: teacher.status,
            permissions: teacher.permissions,
            notes: teacher.notes || "",
            passportPhotoUrl: teacher.passportPhotoUrl || "",
            publicSettings: teacher.publicSettings || {
                showPhoto: true,
                showContacts: false
            }
        });
    }, [teacher]);

    const handleFilePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setPendingImage(reader.result as string);
                setIsEditingPhoto(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenEditor = () => {
        if (teacher.passportPhotoUrl) {
            setIsEditingPhoto(true);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleDeletePhoto = async () => {
        // We'll keep this simple for now or implement another modal if needed
        // but since the user specifically asked about teacher deletion, let's stay focused.
        if (!window.confirm("Удалить фото?")) return;
        setFormData(prev => ({ ...prev, passportPhotoUrl: "" }));
        try {
            await onAction('update', teacher.id, { passportPhotoUrl: "" });
            toast.success("Фото удалено");
            setIsEditingPhoto(false);
        } catch (error) {
            toast.error("Ошибка при удалении");
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onAction('update', teacher.id, {
                ...formData,
                organizationId: teacher.organizationId // Ensure org ID is kept
            });
            toast.success("Профиль преподавателя обновлен");
        } catch (error) {
            console.error(error);
            toast.error("Ошибка при обновлении профиля");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            firstName: teacher.firstName || "",
            lastName: teacher.lastName || "",
            email: teacher.email || "",
            phone: teacher.phone || "",
            specialization: teacher.specialization || "",
            birthDate: teacher.birthDate || "",
            gender: teacher.gender || "",
            address: teacher.address || "",
            citizenship: teacher.citizenship || "",
            nativeLanguage: teacher.nativeLanguage || "",
            role: teacher.role,
            status: teacher.status,
            permissions: teacher.permissions,
            notes: teacher.notes || "",
            passportPhotoUrl: teacher.passportPhotoUrl || "",
            publicSettings: teacher.publicSettings || {
                showPhoto: true,
                showContacts: false
            }
        });
        toast.success("Данные сброшены");
    };

    const handlePhotoSave = async (url: string) => {
        setFormData(prev => ({ ...prev, passportPhotoUrl: url }));
        try {
            await onAction('update', teacher.id, { passportPhotoUrl: url });
            toast.success("Фото обновлено");
            setIsEditingPhoto(false);
            setPendingImage(null);
        } catch (error) {
            toast.error("Не удалось сохранить фото");
        }
    };

    const handlePermissionChange = (key: keyof typeof formData.permissions, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: checked
            }
        }));
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Профиль' },
        { id: 'permissions', icon: Shield, label: 'Права доступа' },
        { id: 'groups', icon: Users, label: 'Группы' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
                {/* Tabs Navigation Zone */}
                <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4">
                    <div className="flex items-center shrink-0 overflow-x-auto no-scrollbar gap-2">
                        <TabsList className="h-[48px] bg-transparent p-0 gap-0.5 flex-nowrap rounded-none border-none no-scrollbar items-center">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "h-[28px] px-2 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all relative font-inter flex items-center gap-1 shrink-0",
                                        "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F6F8]",
                                        "data-[state=active]:text-[#0F4C3D] data-[state=active]:bg-[#0F4C3D]/10 data-[state=active]:shadow-none"
                                    )}
                                >
                                    <tab.icon className="h-3 w-3" />
                                    <span>{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pl-5 pr-8 py-8">
                    <TabsContent value="profile" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col lg:flex-row gap-5 items-start">
                            {/* LEFT COLUMN: SIDEBAR (PHOTO & COMPACT ADMIN NOTES) */}
                            <div className="w-full lg:w-[240px] shrink-0 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                        <Camera className="h-3.5 w-3.5" />
                                        Фото для паспорта
                                    </h4>
                                    <div className="p-4 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] flex justify-center">
                                        <button
                                            onClick={handleOpenEditor}
                                            disabled={isLoading}
                                            className={cn(
                                                "relative w-24 h-32 rounded-[16px] bg-white border border-[#E2E8F0] overflow-hidden shadow-sm shrink-0 transition-all group flex flex-col items-center justify-center",
                                                "hover:border-[#0F4C3D] hover:shadow-md cursor-pointer active:scale-95"
                                            )}
                                        >
                                            {formData.passportPhotoUrl ? (
                                                <>
                                                    <img
                                                        src={formData.passportPhotoUrl}
                                                        alt="Passport"
                                                        className="w-full h-full object-cover object-top cursor-zoom-in"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsPassportModalOpen(true);
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 pointer-events-none">
                                                        <Camera className="h-5 w-5 text-white" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Изменить</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                                                    <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center group-hover:bg-[#0F4C3D]/10 transition-colors">
                                                        <Camera className="h-4 w-4 text-[#94A3B8] group-hover:text-[#0F4C3D] transition-colors" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-tighter group-hover:text-[#0F4C3D] transition-colors leading-tight">Добавить<br />фото</span>
                                                </div>
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*,.heic"
                                            onChange={handleFilePickerChange}
                                        />
                                    </div>
                                </div>

                                {/* SIDEBAR ADMIN COMMENT (Compact) */}
                                <div className="space-y-4">

                                    <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                        <ShieldCheck className="h-3.5 w-3.5 text-[#0F4C3D]" />
                                        Админ. заметка
                                    </h4>
                                    <div className="p-2.5 bg-[#0F4C3D]/5 rounded-[20px] border border-[#0F4C3D]/10 border-dashed space-y-2">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between ml-1 text-[10px] font-bold text-[#0F4C3D]/60 uppercase tracking-tight">
                                                Внутреннее
                                            </div>
                                            <Textarea
                                                placeholder="Заметки..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                className="min-h-[80px] p-3.5 border-[#0F4C3D]/10 bg-white/50 text-[13px] font-medium text-[#0F172A] rounded-[14px] focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D]/30 transition-all font-inter resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2 py-2 text-[10px] text-slate-400 font-mono">
                                    <p>ID: {teacher.id}</p>
                                    <p>CREATED: {new Date(teacher.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>


                            {/* RIGHT COLUMN: PERSONAL DATA FORM */}
                            <div className="flex-1 space-y-4 w-full lg:mt-0">

                                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                    <User className="h-3.5 w-3.5" />
                                    Персональные данные
                                </h4>

                                <div className="p-6 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Имя</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Фамилия</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Телефон</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Дата рождения</Label>
                                            <Input
                                                value={formData.birthDate.split('-').reverse().join('.')}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    if (value.length > 8) value = value.slice(0, 8);

                                                    let displayValue = value;
                                                    if (value.length > 4) displayValue = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
                                                    else if (value.length > 2) displayValue = `${value.slice(0, 2)}.${value.slice(2)}`;

                                                    // Only convert to DB format if full
                                                    if (value.length === 8) {
                                                        const d = value.slice(0, 2);
                                                        const m = value.slice(2, 4);
                                                        const y = value.slice(4);
                                                        setFormData(prev => ({ ...prev, birthDate: `${y}-${m}-${d}` }));
                                                    } else {
                                                        // Temporary store in state to allow typing
                                                        setFormData(prev => ({ ...prev, birthDate: displayValue }));
                                                    }
                                                }}
                                                placeholder="ДД.ММ.ГГГГ"
                                                maxLength={10}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Пол</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}
                                            >
                                                <SelectTrigger className="h-10 w-full shadow-none px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter">
                                                    <SelectValue placeholder="—" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                    <SelectItem value="male" className="text-[13px] font-medium">Мужской</SelectItem>
                                                    <SelectItem value="female" className="text-[13px] font-medium">Женский</SelectItem>
                                                    <SelectItem value="other" className="text-[13px] font-medium">Другой</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Гражданство</Label>
                                            <Select
                                                value={formData.citizenship}
                                                onValueChange={(val) => setFormData(prev => ({ ...prev, citizenship: val }))}
                                            >
                                                <SelectTrigger className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter">
                                                    <SelectValue placeholder="Выберите страну" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                    <SelectItem value="RU" className="text-[13px] font-medium">RU — Россия</SelectItem>
                                                    <SelectItem value="KZ" className="text-[13px] font-medium">KZ — Казахстан</SelectItem>
                                                    <SelectItem value="BY" className="text-[13px] font-medium">BY — Беларусь</SelectItem>
                                                    <SelectItem value="UZ" className="text-[13px] font-medium">UZ — Узбекистан</SelectItem>
                                                    <SelectItem value="KG" className="text-[13px] font-medium">KG — Кыргызстан</SelectItem>
                                                    <SelectItem value="TJ" className="text-[13px] font-medium">TJ — Таджикистан</SelectItem>
                                                    <SelectItem value="AZ" className="text-[13px] font-medium">AZ — Азербайджан</SelectItem>
                                                    <SelectItem value="AM" className="text-[13px] font-medium">AM — Армения</SelectItem>
                                                    <SelectItem value="MD" className="text-[13px] font-medium">MD — Молдова</SelectItem>
                                                    {formData.citizenship && !["RU", "KZ", "BY", "UZ", "KG", "TJ", "AZ", "AM", "MD"].includes(formData.citizenship) && (
                                                        <SelectItem value={formData.citizenship}>{formData.citizenship}</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Родной язык</Label>
                                            <Input
                                                value={formData.nativeLanguage}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                                                placeholder="Русский, Английский..."
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Специализация</Label>
                                        <Input
                                            value={formData.specialization}
                                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                            placeholder="Например: English, German"
                                            className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                            <Label className="text-[12px] font-bold text-[#64748B] font-inter">Email</Label>
                                            {teacher.emailVerified ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] h-4 font-black uppercase tracking-tighter hover:bg-emerald-50">
                                                    <Mail className="w-2 h-2 mr-1" /> Подтвержден
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] h-4 font-black uppercase tracking-tighter hover:bg-amber-50">
                                                    <Mail className="w-2 h-2 mr-1" /> Ожидает подтверждения
                                                </Badge>
                                            )}
                                        </div>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Адрес проживания</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#0F4C3D]/5 focus:border-[#0F4C3D] transition-all font-inter"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 3. PHOTO EDITOR MODAL */}
                        <Dialog open={isEditingPhoto} onOpenChange={(open) => {
                            setIsEditingPhoto(open);
                            if (!open) setPendingImage(null);
                        }}>
                            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]">
                                <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
                                    <DialogHeader>
                                        <DialogTitle className="text-[18px] font-black text-[#0F172A] font-inter">
                                            Фото для паспорта
                                        </DialogTitle>
                                    </DialogHeader>
                                </div>
                                <div className="p-6">
                                    <PassportPhotoEditor
                                        initialImage={pendingImage}
                                        currentPhotoUrl={formData.passportPhotoUrl}
                                        onSave={handlePhotoSave}
                                        onCancel={() => {
                                            setIsEditingPhoto(false);
                                            setPendingImage(null);
                                        }}
                                        onDelete={handleDeletePhoto}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* FOOTER ACTIONS */}
                        <div className="pb-2 flex items-center justify-between mt-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-inter">Изменено</span>
                                <span className="text-[12px] font-bold text-[#0F172A] font-inter">{new Date().toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className="flex items-center gap-2">

                                {teacher.status === 'ARCHIVED' && (
                                    <Button
                                        onClick={() => onAction('activate', teacher.id)}
                                        disabled={isLoading}
                                        className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95 font-inter mr-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                        Восстановить из архива
                                    </Button>
                                )}

                                <Button
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="h-10 w-10 p-0 rounded-full border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all active:scale-95"
                                    title="Сбросить изменения"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={() => onAction('archive', teacher.id)}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="h-10 w-10 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                                    title="В архив"
                                >
                                    <Archive className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={() => onAction('delete', teacher.id)}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="h-10 w-10 p-0 rounded-full border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30 transition-all active:scale-95"
                                    title="Удалить навсегда"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="h-10 pl-4 pr-6 bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white font-bold text-[13px] rounded-full shadow-lg shadow-[#0F4C3D]/20 transition-all flex items-center gap-2 active:scale-95 font-inter"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="permissions" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm p-8 max-w-3xl mx-auto">
                            <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter mb-6">
                                <Shield className="w-3.5 h-3.5 text-[#0F4C3D]" />
                                Роль и Права доступа
                            </h3>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-8 p-6 bg-[#F8FAFC] rounded-[20px] border border-[#E2E8F0]">
                                    <div className="space-y-3">
                                        <Label className="text-[12px] font-bold text-[#64748B] font-inter">Роль в системе</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(v: TeacherRole) => setFormData(prev => ({ ...prev, role: v }))}
                                        >
                                            <SelectTrigger className="bg-white h-10 rounded-full border-[#E2E8F0]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="teacher">Преподаватель</SelectItem>
                                                <SelectItem value="curator">Куратор</SelectItem>
                                                <SelectItem value="admin">Администратор</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Администраторы имеют полный доступ. Кураторы могут управлять группами.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[12px] font-bold text-[#64748B] font-inter">Статус аккаунта</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(v: TeacherStatus) => setFormData(prev => ({ ...prev, status: v }))}
                                        >
                                            <SelectTrigger className="bg-white h-10 rounded-full border-[#E2E8F0]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Активен</SelectItem>
                                                <SelectItem value="SUSPENDED">Приостановлен</SelectItem>
                                                <SelectItem value="INVITED">Приглашен</SelectItem>
                                                <SelectItem value="ARCHIVED">Архив</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[13px] font-bold text-[#0F172A] font-inter">Разрешения</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(formData.permissions).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-[16px] border border-[#E2E8F0] bg-white hover:border-[#0F4C3D]/20 transition-all">
                                                <div className="space-y-0.5">
                                                    <Label className="text-[12px] font-medium text-[#334155] cursor-pointer font-inter" htmlFor={key}>
                                                        {formatPermissionName(key)}
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id={key}
                                                    checked={value as boolean}
                                                    onCheckedChange={(checked) => handlePermissionChange(key as keyof typeof formData.permissions, checked)}
                                                    disabled={formData.role === 'admin'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#E2E8F0] flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="h-10 px-8 bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white font-bold text-[13px] rounded-full shadow-lg shadow-[#0F4C3D]/20 transition-all active:scale-95 font-inter"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить изменения"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="groups" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm p-8 text-center py-20 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-6">
                                <Users className="w-8 h-8 text-[#94A3B8]" />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#0F172A] font-inter mb-2">Группы преподавателя</h3>
                            <p className="text-[13px] text-[#64748B] font-medium max-w-sm mx-auto font-inter">
                                Функционал управления группами находится в разделе "Группы".
                            </p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <TeacherPassportModal
                teacher={teacher}
                open={isPassportModalOpen}
                onOpenChange={setIsPassportModalOpen}
            />
        </div>
    );
}

function formatPermissionName(key: string): string {
    const names: Record<string, string> = {
        canCreateGroups: "Создание групп",
        canManageStudents: "Управление студентами",
        canMarkAttendance: "Отмечать посещаемость",
        canGradeStudents: "Выставлять оценки",
        canSendAnnouncements: "Отправлять объявления",
        canUseChat: "Использовать чат",
        canInviteStudents: "Приглашать студентов"
    };
    return names[key] || key;
}
