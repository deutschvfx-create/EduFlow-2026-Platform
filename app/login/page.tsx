"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService } from "@/lib/services/firestore"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        if (!email || !password) return alert("Введите почту и пароль");
        setLoading(true)

        // --- МАСТЕР-КЛЮЧ: ПУСКАЕТ ТЕБЯ В ОБХОД ВСЕХ ОШИБОК ---
        if (email.toLowerCase() === "rajlatipov01@gmail.com" && password === "12345678") {
            console.log("Вход владельца подтвержден мастер-ключом");
            router.push('/director');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid
            const userData = await UserService.getUser(uid)
            
            if (userData && userData.role?.toUpperCase() === 'STUDENT') {
                router.push('/student')
            } else {
                router.push('/director')
            }
        } catch (e: any) {
            alert("Ошибка: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
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
                <CardFooter>
                    <Button onClick={handleLogin} disabled={loading} className="w-full bg-indigo-600 text-white">
                        {loading ? 'Загрузка...' : 'Войти'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}