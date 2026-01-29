"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

interface SwipeableTab {
    path: string;
    component: React.ReactNode;
}

interface SwipeableTabsProps {
    tabs: SwipeableTab[];
    children: React.ReactNode;
}

export function SwipeableTabs({ tabs, children }: SwipeableTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Find current tab index based on pathname
    useEffect(() => {
        const index = tabs.findIndex(tab => pathname === tab.path);
        if (index !== -1 && index !== currentIndex) {
            setCurrentIndex(index);
        }
    }, [pathname, tabs, currentIndex]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 50;
        const swipeVelocity = 500;

        // Determine swipe direction
        if (
            info.offset.x > swipeThreshold ||
            info.velocity.x > swipeVelocity
        ) {
            // Swipe right - go to previous tab
            navigateToTab(currentIndex - 1, -1);
        } else if (
            info.offset.x < -swipeThreshold ||
            info.velocity.x < -swipeVelocity
        ) {
            // Swipe left - go to next tab
            navigateToTab(currentIndex + 1, 1);
        }
    };

    const navigateToTab = (newIndex: number, dir: number) => {
        if (newIndex >= 0 && newIndex < tabs.length) {
            setDirection(dir);
            setCurrentIndex(newIndex);
            router.push(tabs[newIndex].path);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
        })
    };

    return (
        <div className="relative h-full overflow-hidden laptop:overflow-visible">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={pathname}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
