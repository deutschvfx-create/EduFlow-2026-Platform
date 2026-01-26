
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService } from "@/lib/services/firestore"
import { GraduationCap, Briefcase } from "lucide-react"

function RegisterForm() {
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role')
    // Default to Director if not specified, but UI usually specifies.
    // Ensure we handle "Student" registration for the Test case.
    const role = roleParam === 'student' ? 'STUDENT' : 'DIRECTOR';

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async () => {
        if (!email || !password || !name) {
            alert("Заполните все поля")
            return
        }

        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            // Save Context to Firestore
            // Save Context to Firestore
            const userData = {
                email,
                name,
                role: role === 'DIRECTOR' ? 'OWNER' : 'STUDENT', // Director registers as OWNER initially
                organizationId: role === 'DIRECTOR' ? null : 'pending_invite',
                createdAt: Date.now()
            }
            // @ts-ignore
            await UserService.createUser(uid, userData)

            // Redirect
            if (role === 'DIRECTOR') {
                router.push('/director')
            } else {
                router.push('/student')
            }

        } catch (e: any) {
            console.error(e)
            alert("Registration failed: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl z-10">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-zinc-800 w-fit text-zinc-400">
                    {role === 'STUDENT' ? <GraduationCap className="h-6 w-6 text-indigo-400" /> : <Briefcase className="h-6 w-6 text-purple-400" />}
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {role === 'STUDENT' ? 'Регистрация Ученика' : 'Регистрация Директора'}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Создайте новый аккаунт
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-200">Имя Фамилия</Label>
                    <Input
                        id="name"
                        placeholder="Иван Петров"
                        className="bg-zinc-950 border-zinc-700 text-zinc-100"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-200">Email</Label>
                    <Input
                        id="email"
                        placeholder={role === 'STUDENT' ? "student@school.com" : "director@school.com"}
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
                        className="bg-zinc-950 border-zinc-700 text-zinc-100"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    onClick={handleRegister}
                    disabled={loading}
                    className={`w-full text-white font-medium ${role === 'STUDENT' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {loading ? 'Создание...' : 'Зарегистрироваться'}
                </Button>
                <div className="text-xs text-zinc-500 text-center">
                    Уже есть аккаунт? <a href={`/login?role=${roleParam}`} className="text-zinc-300 hover:text-white underline">Войти</a>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
                <RegisterForm />
            </Suspense>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/5 via-zinc-950 to-zinc-950 pointer-events-none" />
        </div>
    )
}
