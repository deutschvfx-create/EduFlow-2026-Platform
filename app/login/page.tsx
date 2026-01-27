"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
        setLoading(true)
        // МАСТЕР-КЛЮЧ: Пускает тебя мгновенно
        if (email.toLowerCase() === "rajlatipov01@gmail.com" && password === "12345678") {
            router.push('/director');
            return;
        }
        alert("Ошибка: Пользователь не найден. Пожалуйста, используйте данные мастер-ключа или зарегистрируйтесь.");
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-center">Вход в систему</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-950 text-white border-zinc-700" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Пароль</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-950 text-white border-zinc-700" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleLogin} className="w-full bg-indigo-600 text-white">Войти</Button>
                    <Button variant="outline" onClick={() => router.push('/register')} className="w-full border-zinc-700 text-zinc-300">
                        Зарегистрироваться
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}