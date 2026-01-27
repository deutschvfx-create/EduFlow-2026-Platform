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
        setLoading(true)
        try {
            // 1. Пытаемся войти через Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            // 2. ПРОВЕРКА МАСТЕР-КЛЮЧА
            if (email.toLowerCase() === "rajlatipov01@gmail.com") {
                console.log("Вход для Владельца подтвержден");
                router.push('/director');
                return; // Выходим из функции, чтобы не идти в базу
            }

            // 3. Если почта другая, ищем роль в базе
            const userData = await UserService.getUser(uid)
            if (userData) {
                const userRole = userData.role?.toUpperCase(); 
                if (userRole === 'STUDENT') {
                    router.push('/student')
                } else {
                    router.push('/director')
                }
            } else {
                alert("Данные пользователя не найдены.")
            }

        } catch (e: any) {
            console.error("Ошибка входа:", e)
            alert("Ошибка: " + e.message)
        } finally {
            setLoading(false)
        }
    } // <--- ВОТ ЭТА СКОБКА БЫЛА ПРОПУЩЕНА

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">Вход в систему</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-200">Email</Label>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
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
                    <Button 
                        onClick={() => handleLogin()} 
                        disabled={loading} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? 'Загрузка...' : 'Войти'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}