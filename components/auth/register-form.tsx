"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { registerBasicUserAction } from '@/lib/actions/auth-basic.actions';
import Link from 'next/link';

export function RegisterForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Register user (creates user with role='user', organizationId=null)
            const result = await registerBasicUserAction({ email, password });

            if (result.success) {
                // 2. Sign in immediately
                await signInWithEmailAndPassword(auth, email, password);

                // 3. Redirect to dashboard (will show org selection screen)
                router.push('/app/dashboard');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="you@example.com"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                />
            </div>

            {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <p className="text-xs text-center text-gray-600 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
