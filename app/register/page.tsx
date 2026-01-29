
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService } from "@/lib/services/firestore"
import { GraduationCap, Briefcase, Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from "lucide-react"
import { Mascot } from "@/components/shared/mascot"
import { motion, AnimatePresence } from "framer-motion"

function RegisterForm() {
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role')
    const initialName = searchParams.get('name') || ""
    const initialLang = searchParams.get('lang') || "ru"

    const role = roleParam === 'student' ? 'STUDENT' : 'DIRECTOR';

    const [name, setName] = useState(initialName)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [mascotStatus, setMascotStatus] = useState<"idle" | "typing" | "success" | "looking_away" | "thinking">("idle")
    const router = useRouter()

    const handleRegister = async () => {
        if (!email || !password || !name) {
            setMascotStatus("looking_away")
            setTimeout(() => setMascotStatus("idle"), 2000)
            return
        }

        setLoading(true)
        setMascotStatus("thinking")
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            const userData = {
                email,
                name,
                role: role === 'DIRECTOR' ? 'OWNER' : 'STUDENT',
                organizationId: role === 'DIRECTOR' ? null : 'pending_invite',
                createdAt: Date.now()
            }
            // @ts-ignore
            await UserService.createUser(uid, userData)

            setMascotStatus("success")
            await new Promise(r => setTimeout(r, 1000))

            if (role === 'DIRECTOR') {
                router.push('/director')
            } else {
                router.push('/student')
            }

        } catch (e: any) {
            console.error(e)
            setMascotStatus("looking_away")
            alert("Registration failed: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px] relative mt-12 mb-12"
        >
            {/* Mascot Integration */}
            <div className="absolute -top-20 md:-top-32 left-1/2 -translate-x-1/2 w-24 h-24 md:w-40 md:h-40 z-20 pointer-events-none">
                <Mascot status={mascotStatus} className="w-full h-full" />
            </div>

            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4">
                            <Sparkles className="h-3 w-3" /> EduFlow Core 2.0
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                            {role === 'STUDENT' ? 'Регистрация Ученика' : 'Регистрация Директора'}
                        </h1>
                        <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            Начните свой путь в экосистеме
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 group">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Ваше Имя</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    placeholder="Иван Петров"
                                    className="h-14 md:h-16 pl-12 md:pl-14 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl md:rounded-2xl text-white font-bold"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        setMascotStatus("typing")
                                    }}
                                    onBlur={() => setMascotStatus("idle")}
                                />
                            </div>
                        </div>

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
                        onClick={handleRegister}
                        disabled={loading}
                        className={`w-full h-14 md:h-16 rounded-xl md:rounded-2xl text-white font-black uppercase tracking-widest text-base md:text-lg transition-all gap-3 shadow-xl ${role === 'STUDENT'
                            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                            : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                            }`}
                    >
                        {loading ? 'Создание...' : 'Создать аккаунт'}
                        <ArrowRight className="h-5 w-5" />
                    </Button>

                    <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] text-center">
                        Уже зарегистрированы?{' '}
                        <a href="/login" className="text-zinc-400 hover:text-white underline underline-offset-4 transition-colors">Войти</a>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

            <Suspense fallback={<div className="text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">Инициализация...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    )
}
