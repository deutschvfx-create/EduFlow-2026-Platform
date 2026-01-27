"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
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

    useEffect(() => {
        // Prefill for testing
        if (roleParam === 'director') {
            setEmail('rajlatipov01@gmail.com')
        }
    }, [roleParam])

    const handleLogin = async () => {
        setLoading(true)

        try {
            // 🔑 МАСТЕР-КЛЮЧ: Мгновенный вход для владельца БЕЗ Firebase
            if (email.toLowerCase().trim() === "rajlatipov01@gmail.com") {
                console.log("✅ Мастер-ключ активирован!")

                // Сохраняем фейковую сессию в localStorage для совместимости
                localStorage.setItem('user', JSON.stringify({
                    email: 'rajlatipov01@gmail.com',
                    role: 'OWNER',
                    name: 'Raj Latipov'
                }))

                // Небольшая задержка для визуального эффекта
                setTimeout(() => {
                    router.push('/director')
                    router.refresh() // Принудительное обновление
                }, 100)
                return
            }

            // Обычная Firebase аутентификация для всех остальных
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            // Проверка роли в Firestore
            const userData = await UserService.getUser(uid)

            if (userData) {
                // Сохраняем в localStorage
                localStorage.setItem('user', JSON.stringify(userData))

                if (userData.role === 'STUDENT') {
                    router.push('/student')
                } else {
                    router.push('/director')
                }
            } else {
                router.push('/')
            }

        } catch (e: any) {
            console.error("Ошибка входа:", e)
            alert("Ошибка входа: " + (e.message || "Неверный email или пароль"))
        } finally {
            setLoading(false)
        }
    }

    // Обработка Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl shadow-indigo-500/10 z-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-white">
                        {roleParam === 'student' ? 'Вход для Ученика' : roleParam === 'director' ? 'Вход для Директора' : 'Вход в систему'}
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
                            placeholder={roleParam === 'student' ? "student@school.com" : "director@school.com"}
                            className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoComplete="email"
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
                            onKeyPress={handleKeyPress}
                            autoComplete="current-password"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                    {/* Ссылка на регистрацию */}
                    <div className="text-xs text-zinc-500 text-center">
                        Нет аккаунта? <a href={`/register?role=${roleParam || 'director'}`} className="text-zinc-300 hover:text-white underline">Зарегистрироваться</a>
                    </div>
                </CardFooter>
            </Card>
            {/* Красивый фоновый градиент */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
        </div>
    )
}