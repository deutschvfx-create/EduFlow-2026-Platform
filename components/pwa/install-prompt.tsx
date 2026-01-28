"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    detectPlatform,
    isPWAInstalled,
    isTablet,
    getPlatformDisplayName,
    getPlatformIcon,
    type Platform
} from "@/lib/utils/platform-detector";
import { IOSInstallInstructions } from "./ios-install-instructions";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded
    const [platform, setPlatform] = useState<Platform>('unknown');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isTabletDevice, setIsTabletDevice] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Detect platform
        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);
        setIsTabletDevice(isTablet());
        setIsInstalled(isPWAInstalled());

        // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (platform === 'ios') {
            // Show iOS instructions modal
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) {
            // Fallback for browsers that don't support beforeinstallprompt
            alert('Для установки используйте меню браузера: "Установить приложение" или "Добавить на главный экран"');
            return;
        }

        // Show native install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed successfully');
            setIsInstalled(true);
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
    };

    const getPromptText = () => {
        const deviceType = isTabletDevice ? 'планшет' : getPlatformDisplayName(platform);
        const icon = getPlatformIcon(platform);

        if (isInstalled) {
            return {
                icon: '✅',
                title: 'EduFlow установлен',
                subtitle: 'Приложение готово к работе'
            };
        }

        if (platform === 'ios') {
            return {
                icon: '🍏',
                title: 'Добавить на главный экран',
                subtitle: 'Быстрый доступ к EduFlow'
            };
        }

        if (isTabletDevice) {
            return {
                icon: '📱',
                title: 'Установить на планшет',
                subtitle: 'Полноэкранный режим и офлайн доступ'
            };
        }

        return {
            icon,
            title: `Установить EduFlow на ${deviceType}`,
            subtitle: platform === 'windows' || platform === 'macos'
                ? 'Быстрый доступ с рабочего стола'
                : 'Работает офлайн, как нативное приложение'
        };
    };

    const promptText = getPromptText();

    return (
        <>
            {/* Always visible collapsible banner */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, delay: 2 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
            >
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="relative bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-t-2 border-indigo-500/50 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                        {/* Collapse/Expand Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-2 border-indigo-500/50 border-b-0 rounded-t-xl flex items-center justify-center hover:from-indigo-800/95 hover:via-purple-800/95 hover:to-indigo-800/95 transition-all shadow-lg"
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="h-5 w-5 text-white" />
                            </motion.div>
                        </button>

                        {/* Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
                                                {promptText.icon}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                                                    {promptText.title}
                                                </h3>
                                                <p className="text-sm text-zinc-300">
                                                    {promptText.subtitle}
                                                </p>
                                            </div>

                                            {/* Install Button */}
                                            {!isInstalled && (
                                                <Button
                                                    onClick={handleInstall}
                                                    className="h-11 px-6 bg-white hover:bg-zinc-100 text-indigo-900 font-bold shadow-lg gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {platform === 'ios' ? 'Инструкция' : 'Установить'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collapsed state - show mini indicator */}
                        {!isExpanded && (
                            <div className="p-2 flex items-center justify-center">
                                <div className="flex items-center gap-2 text-white text-sm">
                                    <span className="text-2xl">{promptText.icon}</span>
                                    <span className="font-semibold hidden sm:inline">
                                        {isInstalled ? 'Установлено' : 'Установить приложение'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* iOS Instructions Modal */}
            <IOSInstallInstructions
                isOpen={showIOSInstructions}
                onClose={() => setShowIOSInstructions(false)}
            />
        </>
    );
}
