'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Organization } from "@/lib/types/organization";
import { Group } from "@/lib/types/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, CheckCircle2, ChevronRight, School, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { verifyCodeAction, resendVerificationCodeAction, checkUserExistsAction, joinOrganizationAction } from "@/lib/actions/auth.actions";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PublicInvitePage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params?.orgId as string;
    const groupId = params?.groupId as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [org, setOrg] = useState<Organization | null>(null);
    const [group, setGroup] = useState<Group | null>(null);
    const [success, setSuccess] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    // Login & Join Data
    const [existingUser, setExistingUser] = useState<{ name?: string, photoURL?: string, uid: string } | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const isTeacherInvite = groupId === 'teachers';
    const isStudentInvite = groupId === 'students';
    const isSpecificGroupInvite = !isTeacherInvite && !isStudentInvite;

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDateRaw, setBirthDateRaw] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

    // Verification Mode State
    const [verificationMode, setVerificationMode] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [userId, setUserId] = useState("");
    const [verifyingCode, setVerifyingCode] = useState(false);

    // Helper: Birthday Input Mask
    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        // Format as DD.MM.YYYY
        if (value.length > 4) {
            value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}.${value.slice(2)}`;
        }
        setBirthDateRaw(value);
    };

    // Derived State
    const isFull = group && group.maxStudents && (group.studentsCount || 0) >= group.maxStudents;
    const isArchived = group?.status === "ARCHIVED" || group?.status === "INACTIVE";

    useEffect(() => {
        let isMounted = true;
        const fetchData = async (retryCount = 0) => {
            if (!orgId) return;
            if (retryCount === 0) setLoading(true);
            setDbError(null);

            try {
                const { OrganizationService } = await import("@/lib/services/firestore");
                const { doc, getDoc } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                console.log(`[Invite] Fetching data for org: ${orgId} (Attempt ${retryCount + 1})`);

                // Fetch Organization
                const orgData = await OrganizationService.getOrganization(orgId);

                if (!isMounted) return;

                if (!orgData && retryCount < 2) {
                    console.warn("[Invite] Org not found, retrying in 1s...");
                    setTimeout(() => fetchData(retryCount + 1), 1000);
                    return;
                }

                if (orgData) {
                    setOrg(orgData as Organization);
                    setLoading(false);
                }

                // Fetch Group if applicable
                if (orgData && !isTeacherInvite && groupId) {
                    const groupSnap = await getDoc(doc(db, "groups", groupId));
                    if (groupSnap.exists()) {
                        setGroup(groupSnap.data() as Group);
                    } else {
                        console.error("[Invite] Group not found:", groupId);
                    }
                }
            } catch (e: any) {
                console.error("[Invite] Fetch failed:", e);
                if (isMounted) {
                    setDbError(e.code || e.message || "Ошибка подключения к базе данных");
                    setLoading(false);
                }
            } finally {
                if (isMounted && retryCount >= 2) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [orgId, groupId, isTeacherInvite]);

    // Helper: Input Normalization
    const normalizeName = (str: string) => str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();

    // Check if user exists
    const handleEmailBlur = async () => {
        if (!email || !email.includes('@')) return;
        setCheckingEmail(true);
        const res = await checkUserExistsAction(email);
        setCheckingEmail(false);

        if (res.exists && res.uid) {
            setExistingUser({ name: res.name || '', photoURL: res.photoURL || undefined, uid: res.uid });
        } else {
            setExistingUser(null);
        }
    };

    const handleJoin = async () => {
        if (!email || !password) return;

        // Validation for New Users only
        if (!existingUser) {
            if (!firstName || !lastName || !birthDateRaw) return;
            if (isTeacherInvite && (!phone || !gender)) {
                alert("Пожалуйста, заполните все обязательные поля");
                return;
            }
            if (!isTeacherInvite && !group) return;

            // Date Validation
            const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            if (!dateRegex.test(birthDateRaw)) {
                alert("Введите дату рождения в формате ДД.ММ.ГГГГ");
                return;
            }

            const [day, month, year] = birthDateRaw.split('.').map(Number);
            const dateObj = new Date(year, month - 1, day);
            if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
                alert("Некорректная дата рождения");
                return;
            }
            const currentYear = new Date().getFullYear();
            if (year < 1900 || year > currentYear) {
                alert("Пожалуйста, укажите корректный год рождения");
                return;
            }
        }

        // Common Validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Пожалуйста, введите корректный Email адрес");
            return;
        }
        if (password.length < 6) {
            alert("Пароль должен быть не менее 6 символов");
            return;
        }

        setSubmitting(true);

        try {
            // FLOW A: Existing User -> Login & Join
            if (existingUser) {
                // 1. Sign In
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCred.user.getIdToken();

                // 2. Join Organization
                const res = await joinOrganizationAction({
                    idToken,
                    orgId,
                    role: isTeacherInvite ? 'teacher' : 'student',
                    groupId: isSpecificGroupInvite ? groupId : undefined,
                });

                if (!res.success) throw new Error(res.error);

                // Success -> Redirect
                alert(`Вы успешно вступили в школу!`);
                router.push("/app/dashboard");
                return;
            }

            // FLOW B: New User -> Register
            const [day, month, year] = birthDateRaw.split('.').map(Number);
            const cleanFirstName = normalizeName(firstName);
            const cleanLastName = normalizeName(lastName);
            const cleanBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const cleanEmail = email.trim().toLowerCase();

            const { registerUserAction } = await import("@/lib/actions/auth.actions");

            const res = await registerUserAction({
                orgId,
                orgName: org!.name,
                firstName: cleanFirstName,
                lastName: cleanLastName,
                email: cleanEmail,
                password,
                phone: phone.trim(),
                gender: gender as any,
                birthDate: cleanBirthDate,
                role: isTeacherInvite ? 'teacher' : 'student',
                groupId: isSpecificGroupInvite ? groupId : undefined,
            });

            if (!res.success) throw res.error;

            setUserId(res.userId!);
            setVerificationMode(true);

        } catch (e: any) {
            console.error("Registration failed:", e);
            let msg = "Ошибка при регистрации. Пожалуйста, попробуйте снова.";
            if (e.code === 'auth/email-already-in-use') msg = "Данная почта уже занята в системе.";
            else if (e.code === 'auth/wrong-password') msg = "Неверный пароль.";
            else if (e.code === 'auth/user-not-found') msg = "Пользователь не найден.";
            else if (e.code === 'auth/unauthorized-domain') msg = "Domain/IP not authorized in Firebase Console.";
            else if (e.message) msg = `Ошибка: ${e.message}`;
            else if (typeof e === 'string') msg = e;
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSuccess(false);
        setVerificationMode(false);
        setVerificationCode("");
        setFirstName("");
        setLastName("");
        setBirthDateRaw("");
        setEmail("");
        setPassword("");
        setPhone("");
        setGender("");
        setSubmitting(false);
    }

    const handleVerifyCode = async () => {
        if (verificationCode.length !== 4) return;
        setVerifyingCode(true);
        try {
            const res = await verifyCodeAction(userId, verificationCode);
            if (res.success) {
                setSuccess(true);
                setVerificationMode(false);
            } else {
                alert(res.error);
            }
        } catch (e: any) {
            alert("Ошибка при проверке кода: " + e.message);
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleResendCode = async () => {
        setVerifyingCode(true);
        try {
            const res = await resendVerificationCodeAction(email, org!.name, userId);
            if (res.success) {
                alert("Новый код отправлен на вашу почту!");
            } else {
                alert(res.error);
            }
        } catch (e: any) {
            alert("Ошибка при повторной отправке: " + e.message);
        } finally {
            setVerifyingCode(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
        );
    }

    // SECURITY: Archived Group Lockout
    // Only verify group if it is a Specific Group Invite
    if (!org || (isSpecificGroupInvite && (!group || isArchived))) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                    <School className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                    {isArchived ? "Набор закрыт" : "Упс! Ошибка"}
                </h1>
                <p className="text-slate-500 font-medium max-w-xs mb-4">
                    {isArchived
                        ? "Регистрация в эту группу завершена или приостановлена."
                        : "Эта ссылка устарела или данные организации не найдены."}
                </p>
                <div className="p-4 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-400 break-all max-w-xs text-left">
                    DEBUG INFO:<br />
                    ORG_ID: {orgId || 'none'}<br />
                    GROUP_ID: {groupId || 'none'}<br />
                    LOADED_ORG: {org ? 'YES' : 'NO'}<br />
                    ERROR: {dbError || 'NONE'}<br />
                    IS_TEACHER: {isTeacherInvite ? 'YES' : 'NO'}<br />
                    IS_STUDENT_GENERAL: {isStudentInvite ? 'YES' : 'NO'}
                </div>
                <Button variant="ghost" className="mt-8 font-black uppercase text-slate-400" onClick={() => router.push('/')}>Вернуться на главную</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[480px] relative z-10"
            >
                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="pt-10 pb-6 text-center space-y-4">
                        <div className="flex justify-center -mb-2">
                            <div className="h-20 w-20 bg-primary/10 rounded-[1.8rem] flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <GraduationCap className="h-10 w-10 text-primary relative z-10" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60">{org.name}</p>
                            <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                                {isTeacherInvite ? (
                                    <>Регистрация<br /><span className="text-primary underline decoration-primary/20 underline-offset-8">преподавателя</span></>
                                ) : isStudentInvite ? (
                                    <>Регистрация<br /><span className="text-primary underline decoration-primary/20 underline-offset-8">студента</span></>
                                ) : (
                                    <>Вступить в группу<br /><span className="text-primary underline decoration-primary/20 underline-offset-8">«{group?.name}»</span></>
                                )}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-10 space-y-8">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6 space-y-6"
                                >
                                    <div className="flex justify-center">
                                        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-500/10">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                            {isTeacherInvite ? "Проверьте почту!" : "Добро пожаловать!"}
                                        </h2>
                                        <p className="text-slate-500 font-medium">
                                            {isTeacherInvite
                                                ? `Мы отправили письмо с подтверждением на ${email}. Пожалуйста, перейдите по ссылке в письме.`
                                                : "Вы успешно зачислены в группу. Расписание и детали обучения можно найти в нашей системе."}
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 gap-3"
                                        onClick={() => window.location.href = '/'}
                                    >
                                        Открыть личный кабинет <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 text-slate-400 hover:text-primary font-bold uppercase tracking-widest"
                                        onClick={handleReset}
                                    >
                                        Зарегистрировать {isTeacherInvite ? "коллегу" : "ещё одного"}
                                    </Button>
                                </motion.div>
                            ) : verificationMode ? (
                                <motion.div
                                    key="verification"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6 space-y-6"
                                >
                                    <div className="flex justify-center">
                                        <div className="h-20 w-20 bg-primary/5 rounded-[1.8rem] flex items-center justify-center border border-primary/20">
                                            <Loader2 className={cn("h-10 w-10 text-primary", verifyingCode && "animate-spin")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Подтверждение</h2>
                                        <p className="text-slate-500 font-medium">
                                            Мы отправили 4-значный код на почту <span className="text-primary">{email}</span>. Введите его ниже для активации.
                                        </p>
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <Input
                                            type="text"
                                            placeholder="XXXX"
                                            maxLength={4}
                                            className="h-20 w-48 text-center text-4xl font-black tracking-[0.3em] bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-slate-900"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/10 gap-3"
                                        onClick={handleVerifyCode}
                                        disabled={verifyingCode || verificationCode.length !== 4}
                                    >
                                        {verifyingCode ? <Loader2 className="h-6 w-6 animate-spin" /> : "Подтвердить код"}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 text-slate-400 hover:text-primary font-bold uppercase tracking-widest"
                                        onClick={handleResendCode}
                                        disabled={verifyingCode}
                                    >
                                        Отправить код повторно
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="form" className="space-y-6">
                                    <div className="grid grid-cols-1 gap-5">

                                        {/* Existing User: Welcome Back UI */}
                                        {existingUser ? (
                                            <div className="bg-slate-50 rounded-[1.2rem] p-5 flex flex-col items-center text-center space-y-3 border-2 border-primary/10">
                                                <div className="h-20 w-20 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border-2 border-white shadow-xl">
                                                    {existingUser.photoURL ? (
                                                        <img src={existingUser.photoURL} alt={existingUser.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Users className="h-10 w-10 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                                        С возвращением, {existingUser.name?.split(' ')[0]}!
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                                        {existingUser.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2.5">
                                                    <Label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Как вас зовут?</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Имя"
                                                            className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="Фамилия"
                                                            className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Дата рождения</Label>
                                                    <Input
                                                        placeholder="ДД.ММ.ГГГГ"
                                                        className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base"
                                                        value={birthDateRaw}
                                                        onChange={handleBirthDateChange}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2.5">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                                                {existingUser ? "Войти в аккаунт" : "Данные для входа"}
                                            </Label>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="relative">
                                                    <Input
                                                        type="email"
                                                        placeholder="Email адрес"
                                                        className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base pr-10"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        onBlur={handleEmailBlur}
                                                        readOnly={!!existingUser}
                                                        disabled={checkingEmail}
                                                    />
                                                    {checkingEmail && (
                                                        <div className="absolute right-4 top-4">
                                                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <Input
                                                    type="password"
                                                    placeholder={existingUser ? "Введите ваш пароль" : "Придумайте пароль (мин. 6 симв.)"}
                                                    className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {!existingUser && (
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Телефон и Пол</Label>
                                                <div className="space-y-3">
                                                    <Input
                                                        type="tel"
                                                        placeholder="Номер телефона"
                                                        className="h-14 bg-slate-50 border-transparent rounded-[1.2rem] px-5 font-bold focus:bg-white focus:border-primary/20 transition-all text-slate-900 text-base"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {['male', 'female', 'other'].map((g) => (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() => setGender(g as any)}
                                                                className={cn(
                                                                    "h-12 rounded-[1rem] font-bold text-[13px] uppercase tracking-wider transition-all border-2",
                                                                    gender === g
                                                                        ? "bg-primary/5 border-primary text-primary"
                                                                        : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                                                                )}
                                                            >
                                                                {g === 'male' ? 'Муж' : g === 'female' ? 'Жен' : 'Другой'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className={cn(
                                            "w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.15em] transition-all mt-4",
                                            (isFull && !isTeacherInvite && !existingUser)
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                                : "bg-primary hover:bg-primary shadow-2xl shadow-cyan-500/30 text-white",
                                            submitting && "opacity-80 pointer-events-none"
                                        )}
                                        onClick={handleJoin}
                                        disabled={submitting || (!existingUser && (!firstName || !lastName || !birthDateRaw || !email || !password || !phone || !gender)) || (!!isFull && isSpecificGroupInvite && !existingUser)}
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : isFull && isSpecificGroupInvite && !existingUser ? (
                                            "Группа переполнена"
                                        ) : existingUser ? (
                                            "Войти и Вступить"
                                        ) : (
                                            isTeacherInvite ? "Зарегистрироваться" : isStudentInvite ? "Зарегистрироваться" : "Записаться в группу"
                                        )}
                                    </Button>

                                    <div className="pt-4 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                            Нажимая кнопку, вы соглашаетесь с<br />правилами обучения в {org.name}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Footer branding */}
                <div className="mt-10 flex flex-col items-center space-y-4">
                    <div className="h-px w-24 bg-slate-200" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Powered by EDUFLOW</p>
                </div>
            </motion.div>
        </div>
    );
}
