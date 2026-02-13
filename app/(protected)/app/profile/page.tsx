"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ProfileForm } from "@/components/profile/profile-form";
import { Loader2, User } from "lucide-react";

export default function ProfilePage() {
    const { userData, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-8 text-center bg-white/50 backdrop-blur-xl rounded-[24px] border border-white/20">
                <p className="text-muted-foreground">Пользователь не найден</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 pb-6 border-b border-[#DDE7EA]">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#0F3D4C]">
                        Мой профиль
                    </h1>
                    <p className="text-[#0F3D4C]/70 text-sm">
                        Управляйте вашими глобальными данными, доступными во всех школах
                    </p>
                </div>
            </div>

            <ProfileForm userData={userData} />
        </div>
    );
}
