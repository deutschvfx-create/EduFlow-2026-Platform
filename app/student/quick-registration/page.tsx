
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, QrCode, Ticket, ArrowLeft, Camera, X } from "lucide-react";
import QRCode from "react-qr-code";
import Link from "next/link";
import api from "@/lib/api";
// import { QrReader } from 'react-qr-reader';

export default function StudentQuickRegistration() {
    // Tabs state
    const [activeTab, setActiveTab] = useState("qr");

    // QR Generate State
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [qrData, setQrData] = useState<string | null>(null);
    const [timer, setTimer] = useState(600); // 10 minutes

    // Invite/Scan State
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Router
    const router = useRouter();

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (qrData && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [qrData, timer]);

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

    const handleGenerateQR = () => {
        if (!name || !lastName || !validateDate()) {
            alert("Пожалуйста, заполните все поля корректно");
            return;
        }

        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        const data = {
            firstName: name,
            lastName,
            birthDate: dateStr,
            timestamp: Date.now(),
            type: 'STUDENT_QR'
        };
        setQrData(JSON.stringify(data));
        setTimer(600);
    };

    const handleJoinByInvite = async (codeOverride?: string) => {
        const codeToUse = codeOverride || inviteCode;
        if (!codeToUse) return;

        setLoading(true);
        try {
            // Simplified registration with generic name since we don't ask for it
            const fakeEmail = `student_${Date.now()}@local.com`;
            const fakePass = `pass_${Date.now()}`;

            const { data } = await api.post('/auth/register', {
                email: fakeEmail,
                password: fakePass,
                name: `Ученик ${codeToUse.substring(0, 4)}`, // Generic name
                role: 'STUDENT',
                inviteToken: codeToUse,
                // No birthDate here as we don't ask for it
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/student');

        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.error || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    const handleScan = (result: any, error: any) => {
        if (result) {
            setInviteCode(result?.text);
            setShowScanner(false);
            handleJoinByInvite(result?.text);
        }
        // ignore errors for better UX
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}:${rem < 10 ? '0' : ''}${rem}`;
    };

    // Render QR Code View (Generated)
    if (qrData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-sm bg-card border-border shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-white">Покажите учителю</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Код действителен {formatTime(timer)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-lg">
                            <QRCode value={qrData} size={200} />
                        </div>
                        <div className="space-y-1 text-center text-white">
                            <div className="text-xl font-medium">{name} {lastName}</div>
                            <div className="text-muted-foreground">{day}.{month}.{year}</div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => setQrData(null)} className="w-full border-border text-foreground hover:text-white">
                            Назад
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md bg-card border-border shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="p-2 rounded-full bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Быстрая регистрация
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Присоединяйтесь к школе за пару минут
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-secondary">
                            <TabsTrigger value="qr" className="data-[state=active]:bg-secondary text-foreground data-[state=active]:text-white">
                                <QrCode className="mr-2 h-4 w-4" /> QR-код
                            </TabsTrigger>
                            <TabsTrigger value="invite" className="data-[state=active]:bg-secondary text-foreground data-[state=active]:text-white">
                                <Ticket className="mr-2 h-4 w-4" /> Приглашение
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="qr" className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Имя</Label>
                                    <Input
                                        placeholder="Иван"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Фамилия</Label>
                                    <Input
                                        placeholder="Иванов"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Дата рождения</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="ДД"
                                        className="bg-background border-border text-foreground text-center w-16 placeholder:text-muted-foreground"
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                        maxLength={2}
                                    />
                                    <Input
                                        placeholder="ММ"
                                        className="bg-background border-border text-foreground text-center w-16 placeholder:text-muted-foreground"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        maxLength={2}
                                    />
                                    <Input
                                        placeholder="ГГГГ"
                                        className="bg-background border-border text-foreground text-center flex-1 placeholder:text-muted-foreground"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleGenerateQR}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
                            >
                                Создать QR-код
                            </Button>
                        </TabsContent>

                        <TabsContent value="invite" className="mt-6 space-y-6">
                            {showScanner ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg overflow-hidden border border-border relative bg-black h-64 flex flex-col items-center justify-center">
                                        <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                                        <div className="text-muted-foreground text-sm">Сканер QR отключен в Dev Mode</div>
                                        {/* <QrReader ... /> removed to fix build */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-50"></div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowScanner(false)}
                                        className="w-full border-border text-foreground"
                                    >
                                        <X className="mr-2 h-4 w-4" /> Закрыть сканер
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Наведите камеру на QR-код учителя
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">Код приглашения</Label>
                                        <Input
                                            placeholder="Введите код вручную"
                                            className="bg-background border-border text-foreground text-center tracking-wider font-mono placeholder:text-muted-foreground"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => handleJoinByInvite()}
                                            disabled={loading || !inviteCode}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10"
                                        >
                                            {loading ? 'Вход...' : 'Присоединиться'}
                                        </Button>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-border" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-card px-2 text-muted-foreground">Или</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => setShowScanner(true)}
                                            className="w-full border-border text-foreground hover:bg-secondary hover:text-white"
                                        >
                                            <Camera className="mr-2 h-4 w-4" /> Сканировать QR-код
                                        </Button>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
