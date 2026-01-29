'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MascotProps {
    status?: "idle" | "typing" | "success" | "looking_away" | "thinking" | "surprised";
    className?: string;
}

export function Mascot({ status = "idle", className = "" }: MascotProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const getEyeScaleY = () => {
        if (status === "looking_away") return 0.2;
        if (status === "thinking") return 0.6;
        if (status === "surprised") return 1.4;
        return 1;
    };

    const getEyePos = () => {
        if (status === "typing") return { x: 0, y: 8 };
        if (status === "looking_away") return { x: 20, y: -5 };
        return { x: mousePos.x * 0.5, y: mousePos.y * 0.5 };
    };

    // Olaf variants
    const bodyVariants = {
        idle: { y: 0, rotate: 0 },
        success: {
            y: [0, -40, 0],
            rotate: [0, 10, -10, 0],
            transition: { duration: 0.5, repeat: 3 }
        },
        thinking: { rotate: -5 },
        typing: { y: 5 },
        surprised: {
            y: [0, -5, 0],
            transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
        }
    };

    const midSectionVariants = {
        idle: { rotate: 0 },
        success: { rotate: 360, transition: { duration: 1, repeat: 1 } },
    };

    return (
        <div className={`relative ${className}`}>
            <motion.svg
                viewBox="0 0 200 250"
                className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(186,230,253,0.3)]"
                initial="idle"
                animate={status}
            >
                {/* Snowy Floor Shadow */}
                <ellipse cx="100" cy="230" rx="60" ry="10" fill="rgba(186,230,253,0.2)" />

                <motion.g variants={bodyVariants}>
                    {/* BOTTOM SEGMENT */}
                    <motion.g>
                        <circle cx="100" cy="190" r="45" fill="#ffffff" stroke="#e0f2fe" strokeWidth="1" />
                        <circle cx="100" cy="180" r="5" fill="#1e293b" /> {/* Button */}
                        <circle cx="85" cy="225" r="12" fill="#ffffff" stroke="#e0f2fe" strokeWidth="1" /> {/* Left Foot */}
                        <circle cx="115" cy="225" r="12" fill="#ffffff" stroke="#e0f2fe" strokeWidth="1" /> {/* Right Foot */}
                    </motion.g>

                    {/* MIDDLE SEGMENT */}
                    <motion.g variants={midSectionVariants} style={{ originX: "100px", originY: "135px" }}>
                        <ellipse cx="100" cy="135" rx="35" ry="30" fill="#ffffff" stroke="#e0f2fe" strokeWidth="1" />
                        <circle cx="100" cy="125" r="5" fill="#1e293b" /> {/* Button */}
                        <circle cx="100" cy="145" r="5" fill="#1e293b" /> {/* Button */}

                        {/* Arms */}
                        {/* Left Arm */}
                        <motion.path
                            d="M65 130 C40 120, 30 140, 20 135"
                            stroke="#451a03"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            animate={status === "success" ? { rotate: [-20, 20, -20] } : {}}
                        />
                        {/* Right Arm */}
                        <motion.path
                            d="M135 130 C160 120, 170 140, 180 135"
                            stroke="#451a03"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            animate={status === "success" ? { rotate: [20, -20, 20] } : (status === "looking_away" ? { x: -30, y: -40, rotate: -45 } : {})}
                        />
                    </motion.g>

                    {/* HEAD SEGMENT */}
                    <motion.g
                        animate={status === "thinking" ? { rotate: 10, x: 5 } : (status === "typing" ? { y: 10 } : {})}
                        style={{ originX: "100px", originY: "90px" }}
                    >
                        {/* Main Head Shape */}
                        <path
                            d="M100 20 C60 20, 55 60, 55 85 C55 110, 70 125, 100 125 C130 125, 145 110, 145 85 C145 60, 140 20, 100 20 Z"
                            fill="#ffffff"
                            stroke="#e0f2fe"
                            strokeWidth="1"
                        />

                        {/* Mouth & Tooth */}
                        <motion.path
                            d="M75 100 Q100 115, 125 100"
                            stroke="#e0f2fe"
                            strokeWidth="2"
                            fill="none"
                            animate={status === "success" ? { d: "M70 95 Q100 125, 130 95" } : {}}
                        />
                        <rect x="92" y="100" width="16" height="12" rx="2" fill="#ffffff" stroke="#e0f2fe" strokeWidth="0.5" />

                        {/* Eyes Area */}
                        <motion.g animate={getEyePos()}>
                            <ellipse cx="85" cy="55" rx="12" ry="15" fill="#f8fafc" stroke="#e0f2fe" />
                            <motion.circle cx="85" cy="55" r="5" fill="#0f172a" animate={{ scaleY: getEyeScaleY() }} />

                            <ellipse cx="115" cy="55" rx="12" ry="15" fill="#f8fafc" stroke="#e0f2fe" />
                            <motion.circle cx="115" cy="55" r="5" fill="#0f172a" animate={{ scaleY: getEyeScaleY() }} />
                        </motion.g>

                        {/* Eyebrows */}
                        <motion.path
                            d="M75 35 Q85 30, 95 35"
                            stroke="#451a03"
                            strokeWidth="2"
                            fill="none"
                            animate={status === "thinking" ? { y: -5, rotate: -10 } : {}}
                        />
                        <motion.path
                            d="M105 35 Q115 30, 125 35"
                            stroke="#451a03"
                            strokeWidth="2"
                            fill="none"
                            animate={status === "thinking" ? { y: -5, rotate: 10 } : {}}
                        />

                        {/* Carrot Nose */}
                        <motion.path
                            d="M100 70 L140 80 L100 90 Z"
                            fill="#f97316"
                            animate={status === "typing" ? { rotate: 5, y: 2 } : {}}
                        />

                        {/* Hair Twigs */}
                        <path d="M100 20 L95 2" stroke="#451a03" strokeWidth="3" fill="none" />
                        <path d="M105 20 L115 5" stroke="#451a03" strokeWidth="2" fill="none" />
                        <path d="M95 20 L85 8" stroke="#451a03" strokeWidth="2" fill="none" />
                    </motion.g>
                </motion.g>

                {/* Blushes for Success */}
                <AnimatePresence>
                    {status === "success" && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}>
                            <circle cx="75" cy="85" r="8" fill="#fda4af" filter="blur(4px)" />
                            <circle cx="125" cy="85" r="8" fill="#fda4af" filter="blur(4px)" />
                        </motion.g>
                    )}
                </AnimatePresence>
            </motion.svg>
        </div>
    );
}
