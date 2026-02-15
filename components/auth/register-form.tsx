"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Mail,
    Lock,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { UserService } from '@/lib/services/firestore';

export function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create User
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            // 2. Send Verification Email
            await sendEmailVerification(user);

            // 3. Initial Profile Creation
            await UserService.createUser(user.uid, {
                email,
                emailVerified: false,
                onboardingStep: 'verify-email',
                name: email.split('@')[0],
                createdAt: Date.now()
            } as any);

            // 4. Redirect to Verify Email
            router.push('/verify-email');
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
                onClick={handleFinalize}
                disabled={loading || !email || password.length < 6}
                className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] mt-4"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>

            <p className="text-xs text-center text-gray-500 pt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-bold">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
