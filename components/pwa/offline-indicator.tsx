"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOfflineToast, setShowOfflineToast] = useState(false);

    useEffect(() => {
        // Check initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineToast(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineToast(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-0 left-0 right-0 z-50 p-4"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-amber-900/95 via-orange-900/95 to-amber-900/95 backdrop-blur-xl border border-amber-500/50 rounded-xl shadow-2xl shadow-amber-500/20 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <WifiOff className="h-6 w-6 text-amber-400" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-foreground mb-0.5">
                                            Нет подключения к интернету
                                        </h3>
                                        <p className="text-sm text-amber-200">
                                            Вы работаете в офлайн режиме. Некоторые функции могут быть недоступны.
                                        </p>
                                    </div>

                                    {/* Reload Button */}
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        size="sm"
                                        className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Обновить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
