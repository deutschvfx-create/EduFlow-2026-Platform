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
    const router = useRouter()

    const handleLogin = () => {
        // ЭТОТ ALERT ДОЛЖЕН ПОЯВИТЬСЯ ПРИ НАЖАТИИ
        alert("Кнопка нажата! Проверяем почту: " + email);

        if (email.toLowerCase() === "rajlatipov01@gmail.com") {
            alert("Мастер-ключ сработал! Перехожу в кабинет...");
            router.push('/director');
        } else {
            alert("Эта почта не мастер-ключ. Проверьте ввод.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-center">Вход (Тестовый режим)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Email</Label>
                        <Input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="bg-zinc-950 text-white border-zinc-700" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Пароль</Label>
                        <Input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="bg-zinc-950 text-white border-zinc-700" 
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} className="w-full bg-indigo-600 text-white">
                        Войти (ТЕСТ)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}