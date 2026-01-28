'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "../shared/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Languages,
    User,
    Calendar,
    Briefcase,
    GraduationCap,
    ShieldCheck,
    Users,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

type Language = 'ru' | 'en' | 'de' | 'tj';
type Role = 'student' | 'teacher' | 'parent' | 'director';

interface OnboardingData {
    language: Language;
    name: string;
    birthDate: string;
    role: Role | null;
}

const TRANSLATIONS = {
    ru: {
        welcome: "Привет! Добро пожаловать в EduFlow 2.0",
        welcome_sub: "Я твой помощник, Эду-Бот. Давай настроим систему под тебя!",
        choose_lang: "Выберите язык интерфейса",
        ask_name: "Как мне к вам обращаться?",
        placeholder_name: "Ваше имя...",
        nice_to_meet: "Приятно познакомиться, {name}!",
        ask_age: "Когда у тебя день рождения?",
        placeholder_age: "ДД ММ ГГГГ",
        ask_role: "Какую роль вы занимаете в школе?",
        role_director: "Директор / Владелец",
        role_director_desc: "Управление всей организацией, финансами и штатом.",
        role_teacher: "Преподаватель",
        role_teacher_desc: "Работа с группами, журналом и учебными материалами.",
        role_student: "Ученик / Родитель",
        role_student_desc: "Просмотр расписания, оценок и оплаты.",
        next: "Продолжить",
        start: "Поехали!",
        finish: "Завершить настройку"
    },
    en: {
        welcome: "Hi! Welcome to EduFlow 2.0",
        welcome_sub: "I'm Edu-Bot, your helper. Let's set up the system for you!",
        choose_lang: "Choose interface language",
        ask_name: "What should I call you?",
        placeholder_name: "Your name...",
        nice_to_meet: "Nice to meet you, {name}!",
        ask_age: "When is your birthday?",
        placeholder_age: "DD MM YYYY",
        ask_role: "What is your role in the school?",
        role_director: "Director / Owner",
        role_director_desc: "Manage organization, finances, and staff.",
        role_teacher: "Teacher",
        role_teacher_desc: "Work with groups, gradebook, and materials.",
        role_student: "Student / Parent",
        role_student_desc: "View schedule, grades, and payments.",
        next: "Continue",
        start: "Let's go!",
        finish: "Finish Setup"
    },
    de: {
        welcome: "Hallo! Willkommen bei EduFlow 2.0",
        welcome_sub: "Ich bin Edu-Bot, dein Helfer. Richten wir das System für dich ein!",
        choose_lang: "Sprache wählen",
        ask_name: "Wie soll ich dich nennen?",
        placeholder_name: "Dein Name...",
        nice_to_meet: "Freut mich, {name}!",
        ask_age: "Wann hast du Geburtstag?",
        placeholder_age: "TT MM JJJJ",
        ask_role: "Was ist deine Rolle in der Schule?",
        role_director: "Direktor / Inhaber",
        role_director_desc: "Organisation, Finanzen und Personal verwalten.",
        role_teacher: "Lehrer",
        role_teacher_desc: "Gruppen, Notenbuch und Materialien.",
        role_student: "Schüler / Eltern",
        role_student_desc: "Stundenplan, Noten und Zahlungen.",
        next: "Weiter",
        start: "Los geht's!",
        finish: "Einrichtung abschließen"
    },
    tj: {
        welcome: "Салом! Ба EduFlow 2.0 хуш омадед",
        welcome_sub: "Ман Эду-Бот ҳастам. Биёед системаро барои шумо танзим кунем!",
        choose_lang: "Забонро интихоб кунед",
        ask_name: "Шуморо чӣ ном барам?",
        placeholder_name: "Номи шумо...",
        nice_to_meet: "Аз вохӯрӣ бо шумо шодам, {name}!",
        ask_age: "Зодрӯзи шумо кай аст?",
        placeholder_age: "РР ММ СССС",
        ask_role: "Нақши шумо дар мактаб чист?",
        role_director: "Директор / Соҳибкор",
        role_director_desc: "Идоракунии ташкилот, молия ва кормандон.",
        role_teacher: "Муаллим",
        role_teacher_desc: "Кор бо гурӯҳҳо ва журнал.",
        role_student: "Хофиз / Волидайн",
        role_student_desc: "Ҷадвали дарсҳо ва баҳоҳо.",
        next: "Идома",
        start: "Оғоз!",
        finish: "Танзимро анҷом диҳед"
    }
};

export function OnboardingFlow() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        language: 'ru',
        name: '',
        birthDate: '', // Changed from birthYear
        role: null
    });
    const [mascotStatus, setMascotStatus] = useState<"idle" | "typing" | "success" | "looking_away" | "thinking">("idle");

    const t = TRANSLATIONS[data.language];

    const nextStep = () => {
        setMascotStatus("success");
        setTimeout(() => {
            setStep(s => s + 1);
            setMascotStatus("idle");
        }, 600);
    };

    const handleRoleSelect = (role: Role) => {
        setData(d => ({ ...d, role }));
        setMascotStatus("success");
        setTimeout(() => {
            router.push(`/login?role=${role}&name=${data.name}&lang=${data.language}`);
        }, 1000);
    };

    const handleDateChange = (val: string) => {
        // Allow digits only
        let v = val.replace(/\D/g, '').slice(0, 8);

        // Auto-format as DD MM YYYY
        if (v.length > 4) {
            v = `${v.slice(0, 2)} ${v.slice(2, 4)} ${v.slice(4)}`;
        } else if (v.length > 2) {
            v = `${v.slice(0, 2)} ${v.slice(2)}`;
        }

        setData(d => ({ ...d, birthDate: v }));
        if (v.length > 0) setMascotStatus("typing");
    };

    const stepTransition = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-4xl mx-auto p-4 relative overflow-hidden">
            {/* Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

            {/* Mascot Section */}
            <div className="mb-12">
                <Mascot status={mascotStatus} className="w-48 h-48" />
            </div>

            <main className="w-full max-w-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" {...stepTransition} className="space-y-8 text-center">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-white tracking-tight">{t.welcome}</h2>
                                <p className="text-zinc-500 font-medium h-12">{t.welcome_sub}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { code: 'ru' as Language, label: 'Русский', icon: '🇷🇺' },
                                    { code: 'en' as Language, label: 'English', icon: '🇺🇸' },
                                    { code: 'de' as Language, label: 'Deutsch', icon: '🇩🇪' },
                                    { code: 'tj' as Language, label: 'Тоҷикӣ', icon: '🇹🇯' },
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setData(d => ({ ...d, language: lang.code }))}
                                        className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-3 group
                                            ${data.language === lang.code
                                                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white'
                                                : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                                    >
                                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{lang.icon}</span>
                                        <span className="text-sm font-black uppercase tracking-widest">{lang.label}</span>
                                    </button>
                                ))}
                            </div>

                            <Button
                                size="lg"
                                onClick={nextStep}
                                className="w-full h-16 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-black uppercase tracking-widest gap-3 text-lg"
                            >
                                {t.start} <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" {...stepTransition} className="space-y-8 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.ask_name}</h2>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{TRANSLATIONS[data.language].choose_lang}</p>
                            </div>

                            <div className="relative max-w-md mx-auto">
                                <User className={`absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors ${data.name ? 'text-indigo-400' : 'text-zinc-700'}`} />
                                <Input
                                    value={data.name}
                                    onChange={(e) => {
                                        setData(d => ({ ...d, name: e.target.value }));
                                        setMascotStatus("typing");
                                    }}
                                    onBlur={() => setMascotStatus("idle")}
                                    placeholder={t.placeholder_name}
                                    className="h-20 pl-16 pr-8 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-xl font-bold text-white placeholder:text-zinc-800"
                                />
                            </div>

                            <Button
                                size="lg"
                                disabled={data.name.length < 2}
                                onClick={nextStep}
                                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-black uppercase tracking-widest gap-3 text-lg shadow-xl shadow-indigo-500/20"
                            >
                                {t.next} <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" {...stepTransition} className="space-y-8 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                    {t.nice_to_meet.replace('{name}', data.name)}
                                </h2>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{t.ask_age}</p>
                            </div>

                            <div className="relative max-w-[280px] mx-auto">
                                <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors ${data.birthDate?.length === 10 ? 'text-emerald-400' : 'text-zinc-700'}`} />
                                <Input
                                    value={data.birthDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    onBlur={() => setMascotStatus("idle")}
                                    placeholder="DD MM YYYY"
                                    className="h-20 pl-16 pr-8 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.5rem] text-center text-3xl font-black tracking-[0.1em] text-white placeholder:text-zinc-800"
                                />
                            </div>

                            <Button
                                size="lg"
                                disabled={!data.birthDate || data.birthDate.length < 10}
                                onClick={nextStep}
                                className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-black uppercase tracking-widest gap-3 text-lg shadow-xl shadow-emerald-500/20"
                            >
                                {t.next} <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" {...stepTransition} className="space-y-10">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.ask_role}</h2>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Это поможет нам персонализировать ваш опыт</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    {
                                        id: 'director' as Role,
                                        label: t.role_director,
                                        desc: t.role_director_desc,
                                        icon: ShieldCheck,
                                        color: 'text-purple-400',
                                        bg: 'group-hover:bg-purple-500'
                                    },
                                    {
                                        id: 'teacher' as Role,
                                        label: t.role_teacher,
                                        desc: t.role_teacher_desc,
                                        icon: Briefcase,
                                        color: 'text-blue-400',
                                        bg: 'group-hover:bg-blue-500'
                                    },
                                    {
                                        id: 'student' as Role,
                                        label: t.role_student,
                                        desc: t.role_student_desc,
                                        icon: GraduationCap,
                                        color: 'text-amber-400',
                                        bg: 'group-hover:bg-amber-500'
                                    }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        onMouseEnter={() => setMascotStatus("thinking")}
                                        onMouseLeave={() => setMascotStatus("idle")}
                                        className="group relative flex items-center p-6 rounded-3xl bg-zinc-950/50 border border-zinc-800 hover:border-white/20 transition-all duration-300 text-left overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors duration-300 ${role.bg} mr-6`}>
                                            <role.icon className={`h-8 w-8 transition-colors ${role.color} group-hover:text-white`} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="text-lg font-black text-white group-hover:text-white transition-colors uppercase tracking-tight">{role.label}</h3>
                                            <p className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors leading-relaxed line-clamp-1">{role.desc}</p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="mt-12 flex items-center gap-6 text-zinc-700 font-black uppercase text-[10px] tracking-[0.2em]">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> EduFlow Core v2.0
                </div>
                <div className="h-3 w-[1px] bg-zinc-800" />
                <button onClick={() => router.push('/login')} className="hover:text-zinc-500 underline underline-offset-4">Я уже зарегистрирован</button>
            </footer>
        </div>
    );
}
