"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        if (!email) return alert("Введите почту");
        setLoading(true)

        // --- МАСТЕР-КЛЮЧ: ПУСКАЕТ ТЕБЯ МГНОВЕННО ---
        if (email.toLowerCase().trim() === "rajlatipov01@gmail.com") {
            console.log("Вход владельца активирован");
            // Имитируем сохранение пользователя, чтобы сайт не выкидывал
            localStorage.setItem('user', JSON.stringify({ email, role: 'DIRECTOR' }));
            router.push('/director');
            return;
        }

        alert("Для входа используйте почту владельца.");
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl shadow-indigo-500/10 z-10">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">Вход в систему</CardTitle>
                    <CardDescription className="text-center text-zinc-400">Введите данные владельца</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Email</Label>
                        <Input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="rajlatipov01@gmail.com"
                            className="bg-zinc-950 border-zinc-700 text-white" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Пароль</Label>
                        <Input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="bg-zinc-950 border-zinc-700 text-white" 
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}