"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService } from "@/lib/services/firestore"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role')

    const handleLogin = async () => {
        if (!email || !password) return alert("Введите почту и пароль");
        setLoading(true)
        
        try {
            // --- МАСТЕР-КЛЮЧ: ПРОВЕРКА ДО FIREBASE ---
            if (email.toLowerCase() === "rajlatipov01@gmail.com") {
                console.log("Вход владельца через мастер-ключ");
                router.push('/director');
                return;
            }

            // Обычный вход для остальных пользователей
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid
            const userData = await UserService.getUser(uid)

            if (userData) {
                const userRole = userData.role?.toUpperCase(); 
                if (userRole === 'STUDENT') {
                    router.push('/student')
                } else {
                    router.push('/director')
                }
            } else {
                alert("Ошибка: Данные пользователя не найдены в базе.")
            }
        } catch (e: any) {
            console.error(e)
            alert("Ошибка входа: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            {/* Красивый фоновый градиент */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl shadow-indigo-500/10 z-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-white">
                        {roleParam === 'student' ? 'Вход для Ученика' : 'Вход для Директора'}
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Введите ваши данные для входа
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-200">Email</Label>
                        <Input
                            id="email"
                            placeholder="example@mail.com"
                            className="bg-zinc-950 border-zinc-700 text-zinc-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-200">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            className="bg-zinc-950 border-zinc-700 text-zinc-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleLogin} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                    <div className="text-xs text-zinc-500 text-center">
                        Нет аккаунта? <a href={`/register?role=${roleParam || 'director'}`} className="text-zinc-300 hover:text-white underline transition-colors">Зарегистрироваться</a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}