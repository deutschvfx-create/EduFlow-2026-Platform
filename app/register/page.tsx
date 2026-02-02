
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { UserService, OrganizationService, UserRole } from "@/lib/services/firestore"
import { setStoredUser } from "@/lib/auth-helpers"
import { useAuth } from "@/components/auth/auth-provider"
import { Globe, Mail, Lock, User as UserIcon, Building2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

type Step = 'language' | 'auth' | 'info' | 'org' | 'success';

function RegisterFlow() {
    const router = useRouter()
    const { user, userData } = useAuth()
    const [step, setStep] = useState<Step>('language')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form Data
    const [lang, setLang] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('lang') || 'RU' : 'RU'))
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [role, setRole] = useState<UserRole>('OWNER')
    const [orgName, setOrgName] = useState("")
    const [orgType, setOrgType] = useState("")

    // Skip language selection if already set
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('lang')) {
            // setStep('auth'); // User asked to SHOW only language selector as Step 1.
        }
    }, [])

    // If already logged in but no orgId, move to info/org step
    useEffect(() => {
        if (user && !loading) {
            if (userData && !userData.organizationId) {
                if (!userData.firstName) setStep('info');
                else setStep('org');
            } else if (userData?.organizationId) {
                // Already has org, redirect
                router.push('/app/dashboard');
            }
        }
    }, [user, userData, loading, router])

    const saveLang = (l: string) => {
        setLang(l)
        localStorage.setItem('lang', l)
        setStep('auth')
    }

    const handleAuth = async () => {
        setLoading(true)
        setError(null)
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            setStep('info')
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                setError("Этот email уже используется. Попробуйте войти.")
            } else {
                setError(e.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInfo = () => {
        if (!firstName || !lastName) {
            setError("Пожалуйста, заполните имя и фамилию")
            return
        }
        setError(null)
        setStep('org')
    }

    const handleOrgCreation = async () => {
        if (!orgName || !orgType) {
            setError("Пожалуйста, заполните данные организации")
            return
        }
        if (!user) return

        setLoading(true)
        setError(null)
        try {
            // Atomic Bootstrap: Create Organization AND User Profile in one go
            const orgId = await OrganizationService.bootstrapOrganization(
                user.uid,
                {
                    uid: user.uid,
                    email: email || user.email || "",
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    role: role === 'OWNER' ? 'OWNER' : role,
                    createdAt: Date.now()
                },
                {
                    name: orgName,
                    type: orgType
                }
            )

            if (!orgId) throw new Error("Failed to initialize organization")

            // 3. Persist and Redirect
            const finalUserData = {
                uid: user.uid,
                email: email || user.email || "",
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                role: role === 'OWNER' ? 'OWNER' : role as any,
                organizationId: orgId,
                organizationType: orgType,
                createdAt: Date.now()
            }

            localStorage.setItem('edu_org_id', orgId)
            setStoredUser(finalUserData, await user.getIdToken())

            setStep('success')
            setTimeout(() => {
                router.push('/app/dashboard')
            }, 1000)

        } catch (e: any) {
            console.error(e)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 'language':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Choose Language</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase">Выберите язык интерфейса</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['RU', 'EN', 'DE', 'TJ'].map((l) => (
                                <Button
                                    key={l}
                                    variant="outline"
                                    onClick={() => saveLang(l)}
                                    className="h-16 text-lg font-black border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-indigo-500 transition-all"
                                >
                                    {l}
                                </Button>
                            ))}
                        </div>
                    </div>
                )

            case 'auth':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Account Access</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase">Создайте аккаунт или войдите</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700" />
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="h-14 pl-12 bg-zinc-950/50 border-zinc-800 text-white font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-14 pl-12 bg-zinc-950/50 border-zinc-800 text-white font-bold"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                            <Button
                                onClick={handleAuth}
                                disabled={loading || !email || !password}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-base group"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Следующий шаг'}
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <div className="text-center">
                                <a href="/login" className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors">Я уже зарегистрирован</a>
                            </div>
                        </div>
                    </div>
                )

            case 'info':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Your Identity</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase">Как вас зовут?</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">First Name</Label>
                                    <Input
                                        placeholder="Имя"
                                        className="h-14 bg-zinc-950/50 border-zinc-800 text-white font-bold"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Last Name</Label>
                                    <Input
                                        placeholder="Фамилия"
                                        className="h-14 bg-zinc-950/50 border-zinc-800 text-white font-bold"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Project Role</Label>
                                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                                    <SelectTrigger className="h-14 bg-zinc-950/50 border-zinc-800 text-white font-bold">
                                        <SelectValue placeholder="Выберите роль" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        <SelectItem value="OWNER" className="text-white">Директор (Owner)</SelectItem>
                                        <SelectItem value="TEACHER" className="text-white">Преподаватель</SelectItem>
                                        <SelectItem value="STUDENT" className="text-white">Студент</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                            <Button
                                onClick={handleInfo}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-base"
                            >
                                Создать организацию
                            </Button>
                        </div>
                    </div>
                )

            case 'org':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Organization</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase">Настройка структуры подписки</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Org Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700" />
                                    <Input
                                        placeholder="Название школы..."
                                        className="h-14 pl-12 bg-zinc-950/50 border-zinc-800 text-white font-bold"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Org Type</Label>
                                <Select value={orgType} onValueChange={setOrgType}>
                                    <SelectTrigger className="h-14 bg-zinc-950/50 border-zinc-800 text-white font-bold">
                                        <SelectValue placeholder="Тип обучения" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        <SelectItem value="School" className="text-white">Школа</SelectItem>
                                        <SelectItem value="University" className="text-white">Университет</SelectItem>
                                        <SelectItem value="Courses" className="text-white">Курсы / Языки</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                            <Button
                                onClick={handleOrgCreation}
                                disabled={loading}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-base"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Завершить регистрацию'}
                            </Button>
                        </div>
                    </div>
                )

            case 'success':
                return (
                    <div className="text-center space-y-6 py-10">
                        <div className="flex justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500"
                            >
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </motion.div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Success!</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase mt-2">Система готова. Перенаправляем...</p>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-zinc-900/50 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 shadow-3xl"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-zinc-500" />}>
                <RegisterFlow />
            </Suspense>
        </div>
    )
}
