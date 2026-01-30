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
    // If no target, hide or stay at last known position? 
    // Ideally, we move to a resting position or hide.

    if (!targetRect || !isVisible) return null;

    // Calculate center of target for the cursor tip
    // MousePointer2 tip is at top-left (0,0) of the icon box roughly.
    // We want the tip to point to the center of the element.
    const x = targetRect.left + targetRect.width / 2;
    const y = targetRect.top + targetRect.height / 2;

    return (
        <motion.div
            className="fixed z-[9999] pointer-events-none text-indigo-500 drop-shadow-xl"
            initial={{ opacity: 0, x: x - 100, y: y + 50 }}
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
                <MousePointer2 className="w-8 h-8 fill-indigo-500/20 stroke-[3]" />

                {/* Click Ripple Effect */}
                <AnimatePresence>
                    {isClicking && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-2 -left-2 w-12 h-12 bg-indigo-500/30 rounded-full"
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
