"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Building2, Save } from "lucide-react";
import { motion } from "framer-motion";

interface OrganizationProfile {
    name: string;
    type: 'university' | 'language_school';
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    establishedYear?: number;
}

interface OrganizationProfileCardProps {
    onSave?: (profile: OrganizationProfile) => void;
}

export function OrganizationProfileCard({ onSave }: OrganizationProfileCardProps) {
    const [profile, setProfile] = useState<OrganizationProfile>(() => {
        // Try to load from localStorage
        const saved = localStorage.getItem('organization_profile');
        if (saved) return JSON.parse(saved);

        // Try to load from onboarding
        const onboarding = localStorage.getItem('onboarding_data');
        if (onboarding) {
            const data = JSON.parse(onboarding);
            return {
                name: `${data.userName}'s ${data.role === 'director' ? 'University' : 'Language School'}`,
                type: data.role === 'director' ? 'university' : 'language_school',
            };
        }

        return {
            name: '',
            type: 'university',
        };
    });

    const [saving, setSaving] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (file: File) => {
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
            setProfile({ ...profile, logo: e.target?.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleLogoUpload(e.dataTransfer.files[0]);
        }
    };

    const handleSave = () => {
        setSaving(true);
        localStorage.setItem('organization_profile', JSON.stringify(profile));
        onSave?.(profile);

        setTimeout(() => {
            setSaving(false);
        }, 800);
    };

    const getInitials = () => {
        return profile.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-indigo-500/20 shadow-xl shadow-indigo-500/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="h-6 w-6 text-indigo-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Профиль Организации</h2>
                        <p className="text-sm text-zinc-500">Информация о вашем учебном заведении</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                    {/* Logo Upload Zone */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className={`relative w-full aspect-square rounded-2xl border-2 ${dragActive
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : profile.logo
                                        ? 'border-zinc-700 bg-zinc-800/50'
                                        : 'border-dashed border-zinc-700 bg-zinc-900/50'
                                } transition-all cursor-pointer group overflow-hidden`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {profile.logo ? (
                                <img
                                    src={profile.logo}
                                    alt="Organization Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                                        {profile.name ? getInitials() : '?'}
                                    </div>
                                    <div className="text-center px-4">
                                        <Upload className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-zinc-400">Загрузить логотип</p>
                                        <p className="text-xs text-zinc-600 mt-1">PNG, JPG, SVG до 2MB</p>
                                    </div>
                                </div>
                            )}

                            {profile.logo && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleLogoUpload(e.target.files[0]);
                                }
                            }}
                        />

                        <p className="text-xs text-center text-zinc-600">
                            Рекомендуемый размер: 512×512px
                        </p>
                    </div>

                    {/* Organization Info Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Название организации *
                                </Label>
                                <Input
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="Московский Государственный Университет"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Тип учреждения *
                                </Label>
                                <select
                                    value={profile.type}
                                    onChange={(e) => setProfile({ ...profile, type: e.target.value as any })}
                                    className="w-full h-12 bg-zinc-900/50 border border-zinc-800 rounded-md px-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                    <option value="university">🎓 Университет</option>
                                    <option value="language_school">🌍 Языковая школа</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Год основания
                                </Label>
                                <Input
                                    type="number"
                                    value={profile.establishedYear || ''}
                                    onChange={(e) => setProfile({ ...profile, establishedYear: parseInt(e.target.value) || undefined })}
                                    placeholder="1755"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Адрес
                                </Label>
                                <Input
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="Москва, Ленинские горы, 1"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Телефон
                                </Label>
                                <Input
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+7 (495) 939-10-00"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    value={profile.email || ''}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    placeholder="info@university.edu"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Веб-сайт
                                </Label>
                                <Input
                                    type="url"
                                    value={profile.website || ''}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    placeholder="https://www.university.edu"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white h-12"
                                />
                            </div>
                        </div>

                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="pt-4"
                        >
                            <Button
                                onClick={handleSave}
                                disabled={!profile.name || saving}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <Save className="h-5 w-5" />
                                {saving ? 'Сохранение...' : 'Сохранить профиль'}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
