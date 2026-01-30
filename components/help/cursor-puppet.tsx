"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CursorPuppetProps {
    targetRect: DOMRect | null;
    isClicking?: boolean;
    isVisible?: boolean;
}

export function CursorPuppet({ targetRect, isClicking = false, isVisible = true }: CursorPuppetProps) {
    // Determine target coordinates or default to center screen
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    let x, y;

    if (targetRect) {
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.top + targetRect.height / 2;
    } else {
        // Center screen default
        x = windowWidth / 2;
        y = windowHeight / 2;
    }

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-[2147483647]" // MAX_INT z-index
            initial={{ opacity: 1 }} // Ensure container is visible
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="absolute text-indigo-500 drop-shadow-2xl select-none"
                initial={{ opacity: 0, x: x - 50, y: y + 50 }}
                animate={{
                    opacity: 1,
                    x: x - 4, // Adjust for icon alignment (tip is at top-left)
                    y: y - 2,
                    scale: isClicking ? 0.8 : 1
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    scale: { duration: 0.15 }
                }}
            >
                <div className="relative">
                    <MousePointer2 className="w-10 h-10 md:w-8 md:h-8 fill-indigo-500/20 stroke-[3]" />

                    {/* Click Ripple Effect */}
                    <AnimatePresence>
                        {isClicking && (
                            <motion.div
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-2 -left-2 w-14 h-14 bg-indigo-500/40 rounded-full blur-[2px]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
