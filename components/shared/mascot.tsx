'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MascotProps {
    status?: "idle" | "typing" | "success" | "looking_away" | "thinking";
    className?: string;
}

export function Mascot({ status = "idle", className = "" }: MascotProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            setMousePos({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const getEyeScaleY = () => {
        if (status === "looking_away") return 0.1;
        if (status === "thinking") return 0.5;
        return 1;
    };

    const getEyePos = () => {
        if (status === "typing") return { x: 0, y: 5 };
        if (status === "looking_away") return { x: 15, y: -5 };
        return mousePos;
    };

    return (
        <div className={`relative ${className}`}>
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]"
                initial="idle"
                animate={status}
            >
                <motion.circle
                    cx="100"
                    cy="140"
                    r="50"
                    fill="url(#glowGradient)"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <defs>
                    <radialGradient id="glowGradient">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                    <filter id="blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    </filter>
                </defs>

                <motion.g
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <rect
                        x="45"
                        y="35"
                        width="110"
                        height="100"
                        rx="40"
                        fill="url(#bodyGradient)"
                        stroke="#4338ca"
                        strokeWidth="3"
                    />

                    <rect
                        x="55"
                        y="45"
                        width="90"
                        height="60"
                        rx="20"
                        fill="#020617"
                        stroke="#312e81"
                        strokeWidth="2"
                    />

                    <AnimatePresence>
                        {status === "success" && (
                            <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                exit={{ opacity: 0 }}
                            >
                                <circle cx="70" cy="85" r="8" fill="#f43f5e" filter="url(#blur)" />
                                <circle cx="130" cy="85" r="8" fill="#f43f5e" filter="url(#blur)" />
                            </motion.g>
                        )}
                    </AnimatePresence>

                    <motion.g animate={getEyePos()}>
                        <motion.g
                            animate={{
                                scaleY: status === "looking_away" ? 0 : 1,
                                opacity: status === "looking_away" ? 0 : 1
                            }}
                        >
                            <motion.ellipse
                                cx="85"
                                cy="70"
                                rx="12"
                                ry="15"
                                fill="#818cf8"
                                animate={{ scaleY: getEyeScaleY() }}
                            />
                            <circle cx="85" cy="65" r="4" fill="white" opacity="0.8" />
                        </motion.g>

                        <motion.g
                            animate={{
                                scaleY: status === "looking_away" ? 0 : 1,
                                opacity: status === "looking_away" ? 0 : 1
                            }}
                        >
                            <motion.ellipse
                                cx="115"
                                cy="70"
                                rx="12"
                                ry="15"
                                fill="#818cf8"
                                animate={{ scaleY: getEyeScaleY() }}
                            />
                            <circle cx="115" cy="65" r="4" fill="white" opacity="0.8" />
                        </motion.g>
                    </motion.g>

                    <AnimatePresence>
                        {status === "looking_away" && (
                            <motion.g
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                            >
                                <circle cx="85" cy="70" r="15" fill="#312e81" stroke="#4338ca" strokeWidth="2" />
                                <circle cx="115" cy="70" r="15" fill="#312e81" stroke="#4338ca" strokeWidth="2" />
                            </motion.g>
                        )}
                    </AnimatePresence>

                    <motion.path
                        d="M75 35 L60 10"
                        stroke="#4338ca"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{ rotate: [-8, 8, -8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <circle cx="60" cy="10" r="6" fill="#6366f1" />

                    <motion.path
                        d="M125 35 L140 10"
                        stroke="#4338ca"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{ rotate: [8, -8, 8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <circle cx="140" cy="10" r="6" fill="#6366f1" />

                    <motion.rect
                        x="85"
                        y="115"
                        width="30"
                        height="6"
                        rx="3"
                        fill={status === "success" ? "#10b981" : "#6366f1"}
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            scaleX: status === "success" ? 1.5 : 1
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.g>

                <motion.circle
                    cx="25"
                    cy="110"
                    r="12"
                    fill="#312e81"
                    stroke="#4338ca"
                    strokeWidth="2"
                    animate={{
                        y: [0, -25, 0],
                        x: [0, 8, 0],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle
                    cx="175"
                    cy="110"
                    r="12"
                    fill="#312e81"
                    stroke="#4338ca"
                    strokeWidth="2"
                    animate={{
                        y: [0, -25, 0],
                        x: [0, -8, 0],
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                />
            </motion.svg>
        </div>
    );
}
