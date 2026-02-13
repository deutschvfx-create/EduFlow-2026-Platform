
"use client";

import { motion } from "framer-motion";

export function StudentRetentionMatrix() {
    // 5x7 grid of attendance slots (simplified simulation)
    const data = Array.from({ length: 35 }, () => Math.random());

    return (
        <div className="h-64 w-full bg-background/20 rounded-xl border border-border/50 p-4 flex flex-col group">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Retention Heatmap</span>
                <span className="text-[9px] text-muted-foreground">Last 5 Weeks</span>
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1">
                {data.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="rounded-sm aspect-square relative group/dot"
                        style={{
                            backgroundColor: val > 0.8 ? '#10b981' : val > 0.5 ? '#10b98144' : val > 0.3 ? '#10b98111' : '#18181b'
                        }}
                    >
                        <div className="absolute hidden group-hover/dot:block bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-secondary text-[10px] text-foreground px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none border border-border">
                            {Math.floor(val * 100)}% Activity
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Healthy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Silent</span>
                    </div>
                </div>
                <div className="text-[10px] text-foreground font-black">Score: 8.2</div>
            </div>
        </div>
    );
}
