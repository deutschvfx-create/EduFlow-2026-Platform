"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IOSInstallInstructionsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function IOSInstallInstructions({ isOpen, onClose }: IOSInstallInstructionsProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
                    >
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-center">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="text-6xl mb-3">🍏</div>
                                <h2 className="text-2xl font-bold text-white">Установка на iOS</h2>
                                <p className="text-sm text-white/80 mt-1">Добавьте EduFlow на главный экран</p>
                            </div>

                            {/* Instructions */}
                            <div className="p-6 space-y-5">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        1
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Нажмите кнопку "Поделиться"</p>
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <div className="p-2 bg-zinc-800 rounded-lg">
                                                <Share className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <span>В нижней панели Safari</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        2
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Выберите "На экран Домой"</p>
                                        <div className="text-sm text-zinc-400">
                                            Прокрутите вниз и найдите эту опцию
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        3
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Нажмите "Добавить"</p>
                                        <div className="text-sm text-zinc-400">
                                            Готово! Иконка появится на главном экране
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <p className="text-xs text-zinc-400 text-center">
                                        💡 После установки приложение будет работать в полноэкранном режиме
                                    </p>
                                </div>

                                <Button
                                    onClick={onClose}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                                >
                                    Понятно
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
