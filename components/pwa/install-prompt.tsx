"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Download, X } from "lucide-react";
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
    const [isVisible, setIsVisible] = useState(true); // Control banner visibility
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded
    const [platform, setPlatform] = useState<Platform>('unknown');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isTabletDevice, setIsTabletDevice] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if user dismissed the banner
        const dismissed = localStorage.getItem('pwa-banner-dismissed');
        if (dismissed === 'true') {
            setIsVisible(false);
            return;
        }

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
            // Chrome blocked reinstallation - show manual instructions
            const instructions = `
🔧 ИНСТРУКЦИЯ ПО УСТАНОВКЕ:

Chrome заблокировал автоматическую установку.
Используйте ручную установку:

📍 СПОСОБ 1 (Рекомендуется):
1. Нажмите три точки (⋮) в правом верхнем углу браузера
2. Наведите на "Сохранить и поделиться"
3. Выберите "Установить EduFlow 2.0..." или "Создать ярлык..."
4. Отметьте "Открывать в отдельном окне"
5. Нажмите "Установить"

📍 СПОСОБ 2 (Альтернатива):
1. Нажмите Ctrl+Shift+Delete
2. Выберите "Всё время"
3. Отметьте "Файлы cookie и данные сайтов"
4. Нажмите "Удалить данные"
5. Обновите страницу (F5)
6. Кнопка установки появится снова

📍 СПОСОБ 3 (Другой браузер):
Попробуйте установить через Microsoft Edge или другой браузер.

Скопируйте эту инструкцию!
            `.trim();

            alert(instructions);
            return;
        }

        // Show native install prompt
        try {
            deferredPrompt.prompt();

            // Wait for user choice
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA installed successfully');
                setIsInstalled(true);
            }

            // Clear the deferred prompt
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Installation failed:', error);
            alert('Не удалось установить. Попробуйте через меню браузера: ⋮ → Сохранить и поделиться → Установить приложение');
        }
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

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-banner-dismissed', 'true');
    };

    const promptText = getPromptText();

    // Don't render if not visible
    if (!isVisible) return null;

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
                    <div className="relative bg-gradient-to-r from-cyan-900/95 via-purple-900/95 to-cyan-900/95 backdrop-blur-xl border-t-2 border-primary/50 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-secondary/50 hover:bg-secondary/50 flex items-center justify-center transition-colors group"
                            aria-label="Закрыть"
                        >
                            <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </button>

                        {/* Collapse/Expand Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-r from-cyan-900/95 via-purple-900/95 to-cyan-900/95 backdrop-blur-xl border-2 border-primary/50 border-b-0 rounded-t-xl flex items-center justify-center hover:from-cyan-800/95 hover:via-purple-800/95 hover:to-cyan-800/95 transition-all shadow-lg"
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="h-5 w-5 text-foreground" />
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
                                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/30">
                                                {promptText.icon}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                                                    {promptText.title}
                                                </h3>
                                                <p className="text-sm text-foreground">
                                                    {promptText.subtitle}
                                                </p>
                                            </div>

                                            {/* Install Button */}
                                            {!isInstalled && (
                                                <Button
                                                    onClick={handleInstall}
                                                    className="h-11 px-6 bg-white hover:bg-secondary text-cyan-900 font-bold shadow-lg gap-2"
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
                                <div className="flex items-center gap-2 text-foreground text-sm">
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
