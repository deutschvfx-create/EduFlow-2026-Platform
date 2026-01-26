'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, BookOpen, Check, Briefcase, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { createDemoSession } from "@/app/actions";

export default function DirectorSetupPage() {
    const router = useRouter();

    // Step 1: Org Type Selection
    const [step, setStep] = useState(1);
    const [orgType, setOrgType] = useState<string | null>(null);

    // Step 2: Registration
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // DOB
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSelectType = (type: string) => {
        setOrgType(type);
        setStep(2);
    };

    const validateDate = () => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;
        if (y < 1900 || y > new Date().getFullYear()) return false;

        const date = new Date(y, m - 1, d);
        return date.getDate() === d && date.getMonth() === m - 1;
    }

    const validatePassword = (pwd: string) => {
        const hasLetters = /[a-zA-Zа-яА-Я]/.test(pwd);
        const hasNumbers = /\d/.test(pwd);
        return pwd.length >= 6 && hasLetters && hasNumbers;
    }

    const handleSkip = async () => {
        setLoading(true);
        try {
            const data = await createDemoSession();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Assuming org type is defaulted or we don't need to set it for demo? 
            // The server action creates org with type "School".
            // We might want to set org type via API if current page has logic for it, 
            // but demo is specific. Let's just redirect.
            router.push('/app/dashboard');
        } catch (e: any) {
            console.error(e);
            alert("Skip failed: " + e.message);
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !validateDate()) {
            alert("Пожалуйста, заполните все поля корректно");
            return;
        }

        setLoading(true);
        try {
            // Mock Registration for Dev Mode (No DB)
            console.log("Mocking registration for:", email);

            // Handle Skip Logic immediately for everyone in this Dev Mode flow
            // Or act as if we registered
            const fakeUser = {
                id: "d-new-" + Date.now(),
                name: `${firstName} ${lastName}`,
                role: 'OWNER',
                email
            }
            const fakeToken = "mock-token-" + Date.now();

            // 2. Store Token
            localStorage.setItem('token', fakeToken);
            localStorage.setItem('user', JSON.stringify(fakeUser));

            // 3. Set Organization Type (Simulation)
            console.log("Org type selected:", orgType);

            // 4. Redirect
            router.push('/app/dashboard');

        } catch (e: any) {
            console.error(e);
            alert("Ошибка регистрации");
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100">
                <div className="max-w-4xl w-full space-y-8 text-center">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Создание организации
                            </h1>
                        </div>
                        <p className="text-zinc-400 text-lg">Выберите тип вашей образовательной организации</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card
                            className="bg-zinc-900 border-2 border-zinc-800 cursor-pointer transition-all hover:scale-105 hover:border-indigo-500 hover:bg-zinc-800"
                            onClick={() => handleSelectType('LanguageSchool')}
                        >
                            <CardContent className="p-8 flex flex-col items-center gap-6">
                                <div className="p-4 rounded-full bg-zinc-800 text-zinc-400 group-hover:text-indigo-400">
                                    <BookOpen className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Языковой курс</h3>
                                    <p className="text-sm text-zinc-400">Геймификация, оплата подписок, контроль.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="bg-zinc-900 border-2 border-zinc-800 cursor-pointer transition-all hover:scale-105 hover:border-purple-500 hover:bg-zinc-800"
                            onClick={() => handleSelectType('University')}
                        >
                            <CardContent className="p-8 flex flex-col items-center gap-6">
                                <div className="p-4 rounded-full bg-zinc-800 text-zinc-400 group-hover:text-purple-400">
                                    <GraduationCap className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Университет</h3>
                                    <p className="text-sm text-zinc-400">Журнал, сессии, группы, кафедры.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="bg-zinc-900 border-2 border-zinc-800 cursor-pointer transition-all hover:scale-105 hover:border-cyan-500 hover:bg-zinc-800"
                            onClick={() => handleSelectType('School')}
                        >
                            <CardContent className="p-8 flex flex-col items-center gap-6">
                                <div className="p-4 rounded-full bg-zinc-800 text-zinc-400 group-hover:text-cyan-400">
                                    <School className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Школа</h3>
                                    <p className="text-sm text-zinc-400">Дневник, расписание, родительский контроль.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Simplified Registration
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl z-10">
                <CardHeader className="space-y-1 text-center">
                    <div className="absolute left-4 top-4">
                        <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mx-auto mb-4 p-3 rounded-full bg-zinc-800 w-fit">
                        <Briefcase className="h-6 w-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Регистрация Директора
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Создайте аккаунт для вашей школы
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-200">Имя</Label>
                            <Input
                                placeholder="Иван"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-200">Фамилия</Label>
                            <Input
                                placeholder="Петров"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-200">Дата рождения</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="ДД"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 text-center w-16 placeholder:text-zinc-600"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                maxLength={2}
                            />
                            <Input
                                placeholder="ММ"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 text-center w-16 placeholder:text-zinc-600"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                maxLength={2}
                            />
                            <Input
                                placeholder="ГГГГ"
                                className="bg-zinc-950 border-zinc-700 text-zinc-100 text-center flex-1 placeholder:text-zinc-600"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-200">Email</Label>
                        <Input
                            id="email"
                            placeholder="director@school.com"
                            className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-200">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="минимум 6 символов, буквы и цифры"
                            className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    >
                        {loading ? 'Создание...' : 'Зарегистрироваться'}
                    </Button>

                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="text-xs text-zinc-500 text-center">
                            Уже есть аккаунт? <a href="/login" className="text-zinc-300 hover:text-white underline">Войти</a>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                disabled={loading}
                                className="text-xs text-zinc-600 hover:text-zinc-400 h-auto p-0"
                            >
                                Пропустить (Dev Mode)
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
