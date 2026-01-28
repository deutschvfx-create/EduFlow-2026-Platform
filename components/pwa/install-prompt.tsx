"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    detectPlatform,
    isPWAInstalled,
    canInstallPWA,
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
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<Platform>('unknown');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isTabletDevice, setIsTabletDevice] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (dismissed === 'true') return;

        // Check if already installed
        if (isPWAInstalled()) return;

        // Detect platform
        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);
        setIsTabletDevice(isTablet());

        // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show banner after 3 seconds
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS and other browsers that don't support beforeinstallprompt
        if (detectedPlatform === 'ios' && canInstallPWA()) {
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        }

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
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa_install_dismissed', 'true');
        setIsVisible(false);
    };

    const getPromptText = () => {
        const deviceType = isTabletDevice ? 'планшет' : getPlatformDisplayName(platform);
        const icon = getPlatformIcon(platform);

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
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                    >
                        <div className="max-w-4xl mx-auto">
                            <div className="relative bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-t-2 border-indigo-500/50 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
                                {/* Animated gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                                {/* Content */}
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

                                        {/* Buttons */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleInstall}
                                                className="h-11 px-6 bg-white hover:bg-zinc-100 text-indigo-900 font-bold shadow-lg gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                {platform === 'ios' ? 'Инструкция' : 'Установить'}
                                            </Button>
                                            <button
                                                onClick={handleDismiss}
                                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS Instructions Modal */}
            <IOSInstallInstructions
                isOpen={showIOSInstructions}
                onClose={() => {
                    setShowIOSInstructions(false);
                    handleDismiss(); // Also dismiss the banner
                }}
            />
        </>
    );
}
