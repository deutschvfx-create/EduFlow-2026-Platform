
"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a premium feel
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
