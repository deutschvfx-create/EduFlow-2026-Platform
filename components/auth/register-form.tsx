"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School,
    User,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Building2,
    Users,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { OrganizationService, UserService } from '@/lib/services/firestore';

type Step = 'role' | 'account' | 'org' | 'success';
type Role = 'director' | 'student' | 'teacher';

export function RegisterForm() {
    const [step, setStep] = useState<Step>('role');
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('language_school');

    const nextStep = () => {
        if (step === 'role' && !role) return;
        if (step === 'role') setStep('account');
        else if (step === 'account') {
            if (role === 'director') setStep('org');
            else handleFinalize();
        }
    };

    const prevStep = () => {
        if (step === 'account') setStep('role');
        else if (step === 'org') setStep('account');
    };

    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create User
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            // 2. Initial Profile Creation (matches UserData type)
            await UserService.createUser(uid, {
                email,
                role: (role === 'director' ? 'director' : 'user') as any,
                name: email.split('@')[0],
                createdAt: Date.now()
            });

            // 3. Organization Setup (if Director)
            if (role === 'director') {
                const orgId = await OrganizationService.createNewOrganization(uid, {
                    name: orgName,
                    type: orgType
                });

                if (orgId) {
                    setStep('success');
                    setTimeout(() => {
                        window.location.href = '/app/dashboard';
                    }, 2000);
                }
            } else {
                setStep('success');
                setTimeout(() => {
                    window.location.href = '/select-school';
                }, 2000);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {/* STEP: ROLE SELECTION */}
                {step === 'role' && (
                    <motion.div key="role" {...containerVariants} transition={{ duration: 0.3 }} className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Choose your path</Label>
                        <div className="grid gap-3">
                            <button
                                onClick={() => setRole('director')}
                                className={`p-5 rounded-[24px] border-2 transition-all text-left flex items-start gap-4 ${role === 'director'
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                        : 'border-[#DDE7EA] hover:border-[#0F3D4C]/20'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl ${role === 'director' ? 'bg-primary text-white' : 'bg-[#F8FAFB] text-[#0F3D4C]/40'}`}>
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-black text-sm text-[#0F3D4C] uppercase tracking-wider">Director / Owner</div>
                                    <div className="text-[11px] text-[#0F3D4C]/40 font-bold">I want to manage my school</div>
                                </div>
                            </button>

                            <button
                                onClick={() => setRole('teacher')}
                                className={`p-5 rounded-[24px] border-2 transition-all text-left flex items-start gap-4 ${role === 'teacher'
                                        ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
                                        : 'border-[#DDE7EA] hover:border-[#0F3D4C]/20'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl ${role === 'teacher' ? 'bg-emerald-500 text-white' : 'bg-[#F8FAFB] text-[#0F3D4C]/40'}`}>
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-black text-sm text-[#0F3D4C] uppercase tracking-wider">Staff / Student</div>
                                    <div className="text-[11px] text-[#0F3D4C]/40 font-bold">I want to join an existing school</div>
                                </div>
                            </button>
                        </div>
                        <Button
                            disabled={!role}
                            onClick={nextStep}
                            className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] mt-4"
                        >
                            Next Challenge <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <p className="text-xs text-center text-gray-500 pt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-bold">
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                )}

                {/* STEP: ACCOUNT INFO */}
                {step === 'account' && (
                    <motion.div key="account" {...containerVariants} transition={{ duration: 0.3 }} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={prevStep} className="p-2 hover:bg-[#F8FAFB] rounded-full transition-colors">
                                <ArrowLeft className="h-4 w-4 text-[#0F3D4C]/40" />
                            </button>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40">Your credentials</Label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Work Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="your@school.com"
                                        className="h-14 pl-12 bg-white border-[#DDE7EA] rounded-[20px] font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-14 pl-12 bg-white border-[#DDE7EA] rounded-[20px] font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 text-[10px] font-black uppercase text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={role === 'director' ? nextStep : handleFinalize}
                            disabled={loading || !email || password.length < 6}
                            className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] mt-4"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                role === 'director' ? 'One last step' : 'Launch Dashboard'
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* STEP: ORG INFO (Directors Only) */}
                {step === 'org' && (
                    <motion.div key="org" {...containerVariants} transition={{ duration: 0.3 }} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={prevStep} className="p-2 hover:bg-[#F8FAFB] rounded-full transition-colors">
                                <ArrowLeft className="h-4 w-4 text-[#0F3D4C]/40" />
                            </button>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40">School Identity</Label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Organization Name</Label>
                                <div className="relative group">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="e.g. Oxford English Academy"
                                        className="h-14 pl-12 bg-white border-[#DDE7EA] rounded-[20px] font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Education Type</Label>
                                <Select value={orgType} onValueChange={setOrgType}>
                                    <SelectTrigger className="h-14 bg-white border-[#DDE7EA] rounded-[20px] font-bold ring-0 focus:ring-4 focus:ring-primary/5">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#DDE7EA]">
                                        <SelectItem value="language_school">Language School</SelectItem>
                                        <SelectItem value="university">University / Faculty</SelectItem>
                                        <SelectItem value="college">College</SelectItem>
                                        <SelectItem value="training_center">Training Center</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 text-[10px] font-black uppercase text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleFinalize}
                            disabled={loading || !orgName}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 rounded-[20px] font-black uppercase tracking-widest text-[11px] mt-4 shadow-xl shadow-emerald-600/20"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Setup'}
                        </Button>
                    </motion.div>
                )}

                {/* STEP: SUCCESS */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-10 space-y-6"
                    >
                        <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-[#0F3D4C] tracking-tight">System Ready!</h3>
                            <p className="text-[10px] text-[#0F3D4C]/40 uppercase font-black tracking-widest">Bridging you to your workspace...</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="h-1 w-20 bg-emerald-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 2, ease: "linear" }}
                                    className="h-full w-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
