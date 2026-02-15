"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationService } from '@/lib/services/firestore';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { School, Building, Loader2, ArrowRight, Building2 } from 'lucide-react';

export default function OrganizationOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('language_school');

    const handleCreateOrganization = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        setError(null);
        try {
            await OrganizationService.createOrganizationWithTransaction(auth.currentUser.uid, {
                name: orgName,
                type: orgType
            });
            router.push('/onboarding/complete');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-[#0F3D4C]/5 border border-[#DDE7EA] space-y-8">
                <div className="text-center space-y-4">
                    <div className="h-20 w-20 bg-[#0F3D4C]/5 rounded-full flex items-center justify-center mx-auto text-[#0F3D4C]">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-[#0F3D4C] tracking-tight text-center uppercase tracking-tighter">Настройка школы</h1>
                        <p className="text-xs text-[#0F3D4C]/40 font-bold uppercase tracking-widest leading-relaxed">
                            Создайте ваше рабочее пространство. Это займет меньше минуты.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Название организации</Label>
                        <div className="relative group">
                            <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Напр. Oxford English Academy"
                                className="h-14 pl-12 bg-[#F8FAFB] border-[#DDE7EA] rounded-[20px] font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Тип заведения</Label>
                        <Select value={orgType} onValueChange={setOrgType}>
                            <SelectTrigger className="h-14 bg-[#F8FAFB] border-[#DDE7EA] rounded-[20px] font-bold ring-0 focus:ring-4 focus:ring-primary/5">
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#DDE7EA]">
                                <SelectItem value="language_school" className="font-bold">Языковая школа</SelectItem>
                                <SelectItem value="university" className="font-bold">Университет / Факультет</SelectItem>
                                <SelectItem value="college" className="font-bold">Колледж</SelectItem>
                                <SelectItem value="training_center" className="font-bold">Учебный центр</SelectItem>
                                <SelectItem value="online_school" className="font-bold">Онлайн-школа</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 text-[10px] font-black uppercase text-center animate-shake">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleCreateOrganization}
                    disabled={loading || !orgName}
                    className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] mt-4 shadow-xl shadow-[#0F3D4C]/10"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                            Продолжить
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
