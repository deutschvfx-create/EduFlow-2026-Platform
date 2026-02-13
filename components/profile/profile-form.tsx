"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserData, UserService } from "@/lib/services/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Camera, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const profileSchema = z.object({
    firstName: z.string().min(2, "Имя должно быть не менее 2 символов"),
    lastName: z.string().min(2, "Фамилия должна быть не менее 2 символов"),
    phone: z.string().min(10, "Введите корректный номер телефона"),
    gender: z.enum(["male", "female", "other"]),
    birthDate: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    userData: UserData;
}

export function ProfileForm({ userData }: ProfileFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phone: userData.phone || "",
            gender: userData.gender as any || "other",
            birthDate: userData.birthDate || "",
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await UserService.updateUser(userData.uid, {
                ...values,
                name: `${values.firstName} ${values.lastName}`,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setError(e.message || "Произошла ошибка при сохранении");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Profile Header / Photo */}
            <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-2 ring-primary/20">
                        <AvatarImage src={userData.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-3xl font-bold uppercase">
                            {userData.firstName?.[0]}{userData.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                        {userData.firstName} {userData.lastName}
                    </h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
                        Личный профиль
                    </p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 backdrop-blur-xl p-8 rounded-[24px] border border-white/20 shadow-xl">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Имя</Label>
                    <Input
                        {...form.register("firstName")}
                        className="h-12 bg-white border-border rounded-xl focus:ring-primary/20"
                        placeholder="Ваше имя"
                    />
                    {form.formState.errors.firstName && (
                        <p className="text-[10px] text-red-500 font-medium px-1 uppercase tracking-tight">
                            {form.formState.errors.firstName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Фамилия</Label>
                    <Input
                        {...form.register("lastName")}
                        className="h-12 bg-white border-border rounded-xl focus:ring-primary/20"
                        placeholder="Ваша фамилия"
                    />
                    {form.formState.errors.lastName && (
                        <p className="text-[10px] text-red-500 font-medium px-1 uppercase tracking-tight">
                            {form.formState.errors.lastName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Телефон</Label>
                    <Input
                        {...form.register("phone")}
                        className="h-12 bg-white border-border rounded-xl focus:ring-primary/20"
                        placeholder="+7 (___) ___-__-__"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Дата рождения</Label>
                    <Input
                        type="date"
                        {...form.register("birthDate")}
                        className="h-12 bg-white border-border rounded-xl focus:ring-primary/20"
                    />
                </div>

                <div className="md:col-span-2 pt-4">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all font-bold group"
                    >
                        {isSaving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : success ? (
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5" />
                                <span>Сохранено</span>
                            </div>
                        ) : (
                            "Сохранить изменения"
                        )}
                    </Button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
                        >
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-xs font-medium">{error}</span>
                        </motion.div>
                    )}
                </div>
            </form>
        </div>
    );
}
