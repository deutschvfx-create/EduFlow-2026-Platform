"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Mascot } from "@/components/shared/mascot"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react"
import { setStoredUser } from "@/lib/auth-helpers"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService } from "@/lib/services/firestore"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [mascotStatus, setMascotStatus] = useState<"idle" | "typing" | "success" | "looking_away" | "thinking">("idle")

    // Auto-fill from URL params (from Onboarding)
    useEffect(() => {
        const roleParam = searchParams.get('role')
        const nameParam = searchParams.get('name')

        if (roleParam === 'OWNER' && !email) setEmail('director@eduflow.com')
        if (roleParam === 'STUDENT' && !email) setEmail('student@eduflow.com')

        if (nameParam) {
            // Optional: Show a toast or welcome message
            console.log("Welcome,", nameParam)
        }
    }, [searchParams, email])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        setLoading(true)
        setMascotStatus("thinking")

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            // Get data from Firestore
            const data = await UserService.getUser(uid)

            if (data) {
                setMascotStatus("success")
                const token = await userCredential.user.getIdToken()
                setStoredUser(data, token)

                if (data.organizationId) {
                    router.push(data.role === 'STUDENT' ? '/student' : '/app/dashboard')
                } else {
                    router.push('/register')
                }
            } else {
                throw new Error("Профиль пользователя не найден")
            }
        } catch (error: any) {
            console.error(error)
            setMascotStatus("looking_away")
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium tracking-wide mb-2">
                        <Sparkles className="h-3 w-3" /> Welcome Back
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Вход в систему</h1>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5 group">
                        <Label className="text-xs font-medium text-zinc-500 px-1">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                className="h-11 pl-10 bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-white font-medium text-sm transition-all placeholder:text-zinc-600"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setMascotStatus("typing")
                                }}
                                onBlur={() => setMascotStatus("idle")}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 group">
                        <Label className="text-xs font-medium text-zinc-500 px-1">Пароль</Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-600 group-focus-within:text-pink-400 transition-colors" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-11 pl-10 bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-xl text-white font-medium text-sm transition-all placeholder:text-zinc-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setMascotStatus("looking_away")}
                                onBlur={() => setMascotStatus("idle")}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold tracking-wide text-sm transition-all gap-2 shadow-lg shadow-indigo-500/20"
                >
                    {loading ? 'Вход...' : 'Войти'}
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="flex flex-col gap-4 text-center">
                    <div className="text-xs text-zinc-500 font-medium">
                        Нет аккаунта?{' '}
                        <a href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold lowercase tracking-wider">Регистрация</a>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 p-4 relative overflow-y-auto overflow-x-hidden supports-[min-height:100dvh]:min-h-[100dvh]">
            {/* Background elements - Fixed to stay in place */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm relative"
            >
                {/* Mascot */}
                <div className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 z-20 pointer-events-none opacity-90 transition-all duration-300 peer-focus-within:translate-y-[-10px] md:peer-focus-within:translate-y-0">
                    <Mascot status="idle" className="w-full h-full" />
                </div>

                <Suspense fallback={<div className="text-white text-center">Loading interface...</div>}>
                    <LoginForm />
                </Suspense>
            </motion.div>
        </div>
    )
}
