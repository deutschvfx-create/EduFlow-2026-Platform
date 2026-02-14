"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AuthCardProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] p-6 relative overflow-hidden">
            {/* Premium Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Glassmorphism Card */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] border border-white/40 shadow-[0_32px_64px_-16px_rgba(15,61,76,0.08)] overflow-hidden">
                    <div className="p-8 md:p-10">
                        {/* Header Section */}
                        <div className="mb-8 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4"
                            >
                                <Sparkles className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">EduFlow 2026</span>
                            </motion.div>

                            <h1 className="text-3xl font-black text-[#0F3D4C] tracking-tight leading-none">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm font-medium text-[#0F3D4C]/50 mt-3 leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="mt-8 flex justify-center items-center gap-4 opacity-30">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#0F3D4C]" />
                    <span className="text-[10px] font-bold text-[#0F3D4C] uppercase tracking-[0.3em]">Premium Experience</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#0F3D4C]" />
                </div>
            </motion.div>
        </div>
    );
}
