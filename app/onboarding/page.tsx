
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, BookOpen, Check } from "lucide-react";
import { setOrganizationType } from "@/app/actions";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = async (type: 'LanguageSchool' | 'University' | 'School') => {
        setSelected(type);
        try {
            await api.post('/org/type', { type });
            setTimeout(() => {
                router.push('/director');
            }, 800);
        } catch (e) {
            console.error(e);
            alert("Failed to save organization type");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100">
            <div className="max-w-4xl w-full space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Добро пожаловать в EduFlow
                    </h1>
                    <p className="text-zinc-400 text-lg">Выберите тип вашей образовательной организации, чтобы настроить платформу.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Language School Choice */}
                    <Card
                        className={`bg-zinc-900 border-2 cursor-pointer transition-all hover:scale-105 ${selected === 'LanguageSchool' ? 'border-indigo-500 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
                        onClick={() => handleSelect('LanguageSchool')}
                    >
                        <CardContent className="p-8 flex flex-col items-center gap-6">
                            <div className={`p-4 rounded-full ${selected === 'LanguageSchool' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                <BookOpen className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Языковой курс</h3>
                                <p className="text-sm text-zinc-400">Геймификация, оплата подписок, контроль активности.</p>
                            </div>
                            {selected === 'LanguageSchool' && <Check className="h-6 w-6 text-indigo-500 animate-in zoom-in" />}
                        </CardContent>
                    </Card>

                    {/* University Choice */}
                    <Card
                        className={`bg-zinc-900 border-2 cursor-pointer transition-all hover:scale-105 ${selected === 'University' ? 'border-purple-500 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
                        onClick={() => handleSelect('University')}
                    >
                        <CardContent className="p-8 flex flex-col items-center gap-6">
                            <div className={`p-4 rounded-full ${selected === 'University' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                <GraduationCap className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Университет</h3>
                                <p className="text-sm text-zinc-400">Детальный журнал посещаемости, сессии, группы.</p>
                            </div>
                            {selected === 'University' && <Check className="h-6 w-6 text-purple-500 animate-in zoom-in" />}
                        </CardContent>
                    </Card>

                    {/* School Choice */}
                    <Card
                        className={`bg-zinc-900 border-2 cursor-pointer transition-all hover:scale-105 ${selected === 'School' ? 'border-cyan-500 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
                        onClick={() => handleSelect('School')}
                    >
                        <CardContent className="p-8 flex flex-col items-center gap-6">
                            <div className={`p-4 rounded-full ${selected === 'School' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                <School className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Школа</h3>
                                <p className="text-sm text-zinc-400">Дневник, расписание, родительский контроль.</p>
                            </div>
                            {selected === 'School' && <Check className="h-6 w-6 text-cyan-500 animate-in zoom-in" />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
