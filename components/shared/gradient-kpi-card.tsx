"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface GradientKPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    trend?: string;
    isUp?: boolean;
}

export function GradientKPICard({
    title,
    value,
    icon: Icon,
    gradient,
    trend,
    isUp
}: GradientKPICardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Card className={`relative overflow-hidden border-none shadow-2xl ${gradient}`}>
                {/* Decorative background circle */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                            <Icon className="h-6 w-6 text-foreground shadow-glow" />
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-foreground uppercase tracking-wider shadow-sm">
                                {isUp ? "↑" : "↓"} {trend}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">
                            {title}
                        </p>
                        <h3 className="text-4xl font-black text-foreground tracking-tighter">
                            {value}
                        </h3>
                    </div>
                </CardContent>

                {/* Glow effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </Card>
        </motion.div>
    );
}
