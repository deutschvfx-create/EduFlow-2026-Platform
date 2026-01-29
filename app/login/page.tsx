"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Mascot } from "@/components/shared/mascot"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles, Terminal } from "lucide-react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [mascotStatus, setMascotStatus] = useState<"idle" | "typing" | "success" | "looking_away" | "thinking">("idle")
    const [showDevMode, setShowDevMode] = useState(false)

    // Auto-fill from URL params (from Onboarding)
    useEffect(() => {
        const roleParam = searchParams.get('role')
        const nameParam = searchParams.get('name')

        if (roleParam === 'director' && !email) setEmail('director@eduflow.com')
        if (roleParam === 'student' && !email) setEmail('student@eduflow.com')

        if (nameParam) {
            // Optional: Show a toast or welcome message
            console.log("Welcome,", nameParam)
        }
    }, [searchParams, email])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMascotStatus("thinking")

        // Mock login delay
        await new Promise(r => setTimeout(r, 1500))

        let targetRole = 'STUDENT'
        let redirectUrl = '/student'

        // Director Login Logic
        if (email.includes('director') || email === 'rajlatipov01@gmail.com') {
            targetRole = 'OWNER'
            redirectUrl = '/app/dashboard'
        }

        // Student Login Logic
        if (email.includes('student')) {
            targetRole = 'STUDENT'
            redirectUrl = '/student'
        }

        if (email) {
            setMascotStatus("success")
            localStorage.setItem('user', JSON.stringify({
                email: email,
                role: targetRole,
                name: 'Raj Latipov'
            }));
            router.push(redirectUrl)
        } else {
            setMascotStatus("looking_away")
            alert("Пожалуйста, введите Email.")
        }
        setLoading(false)
    }

    const skipAuth = async (role: 'director' | 'student') => {
        setMascotStatus("success")
        localStorage.setItem('user', JSON.stringify({
            email: role === 'director' ? 'director@eduflow.com' : 'student@eduflow.com',
            role: role.toUpperCase() === 'DIRECTOR' ? 'OWNER' : 'STUDENT',
            name: 'Demo User'
        }));
        await new Promise(r => setTimeout(r, 800));
        router.push(role === 'director' ? '/app/dashboard' : '/student');
    }

    return (
        <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
                <div className="space-y-2 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4">
                        <Sparkles className="h-3 w-3" /> Welcome Back
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Вход в систему</h1>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2 group">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                className="h-14 md:h-16 pl-12 md:pl-14 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl md:rounded-2xl text-white font-bold"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setMascotStatus("typing")
                                }}
                                onBlur={() => setMascotStatus("idle")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Пароль</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-pink-400 transition-colors" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-14 md:h-16 pl-12 md:pl-14 bg-zinc-950/50 border-zinc-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-xl md:rounded-2xl text-white font-bold"
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
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-base md:text-lg transition-all gap-3 shadow-xl shadow-indigo-500/20"
                >
                    {loading ? 'Вход...' : 'Войти'}
                    <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="flex flex-col gap-4 text-center">
                    <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
                        Нет аккаунта?{' '}
                        <a href="/onboarding" className="text-zinc-400 hover:text-white underline underline-offset-4">Регистрация</a>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDevMode(!showDevMode)}
                        className="flex items-center justify-center gap-2 text-[9px] text-zinc-800 hover:text-zinc-600 font-black uppercase tracking-widest transition-colors mt-4"
                    >
                        <Terminal className="h-3 w-3" /> Terminal Access
                    </button>
                </div>
            </form>

            {/* Discrete Dev Mode */}
            <AnimatePresence>
                {showDevMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 pt-8 border-t border-zinc-800 space-y-3"
                    >
                        <p className="text-[9px] text-rose-500/50 font-black uppercase tracking-[0.3em] text-center mb-4">Development Bypass Active</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => skipAuth('director')}
                                variant="outline"
                                className="border-zinc-800 bg-zinc-950/50 text-[10px] font-black uppercase text-zinc-500 hover:text-white hover:border-zinc-600 h-10 rounded-xl"
                            >
                                Director
                            </Button>
                            <Button
                                onClick={() => skipAuth('student')}
                                variant="outline"
                                className="border-zinc-800 bg-zinc-950/50 text-[10px] font-black uppercase text-zinc-500 hover:text-white hover:border-zinc-600 h-10 rounded-xl"
                            >
                                Student
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] relative"
            >
                {/* Mascot */}
                <div className="absolute -top-20 md:-top-32 left-1/2 -translate-x-1/2 w-24 h-24 md:w-40 md:h-40 z-20 pointer-events-none">
                    <Mascot status="idle" className="w-full h-full" />
                </div>

                <Suspense fallback={<div className="text-white text-center">Loading interface...</div>}>
                    <LoginForm />
                </Suspense>
            </motion.div>
        </div>
    )
}
