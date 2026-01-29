'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    Sparkles, Search, X, MapPin, Bot, Lightbulb, PlayCircle,
    ChevronRight, ChevronLeft, CheckCircle2
} from "lucide-react";
import { helpSections, HelpSection } from "@/lib/help-content";
import { Mascot } from "@/components/shared/mascot";
import { motion, AnimatePresence } from 'framer-motion';

export function HelpAssistant() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeSection, setActiveSection] = useState<HelpSection | null>(null);

    // Sequential Tour State
    const [isTouring, setIsTouring] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    // Auto-select section based on route
    useEffect(() => {
        if (open) {
            const exactMatch = helpSections.find(s => s.route === pathname);
            if (exactMatch) {
                setActiveSection(exactMatch);
            } else {
                setActiveSection(null);
            }
        }
    }, [pathname, open]);

    // Global toggle listener
    useEffect(() => {
        const handleOpenHelp = () => setOpen(true);
        window.addEventListener('open-help', handleOpenHelp);
        return () => window.removeEventListener('open-help', handleOpenHelp);
    }, []);

    const updateHighlight = useCallback((targetId: string) => {
        const el = document.querySelector(`[data-help-id="${targetId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                setHighlightRect(el.getBoundingClientRect());
            }, 400);
        } else {
            console.warn(`Element with data-help-id="${targetId}" not found.`);
            setHighlightRect(null);
        }
    }, []);

    const startTour = (section: HelpSection) => {
        setOpen(false);
        setIsTouring(true);
        setTourStep(0);

        // Find first step with targetId
        const firstStepWithTarget = section.steps.find(s => s.targetId);
        if (firstStepWithTarget) {
            updateHighlight(firstStepWithTarget.targetId!);
        } else if (section.highlightId) {
            updateHighlight(section.highlightId);
        }
    };

    const nextStep = () => {
        if (!activeSection) return;
        const nextIdx = tourStep + 1;
        if (nextIdx < activeSection.steps.length) {
            setTourStep(nextIdx);
            const targetId = activeSection.steps[nextIdx].targetId;
            if (targetId) updateHighlight(targetId);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (!activeSection || tourStep === 0) return;
        const prevIdx = tourStep - 1;
        setTourStep(prevIdx);
        const targetId = activeSection.steps[prevIdx].targetId;
        if (targetId) updateHighlight(targetId);
    };

    const endTour = () => {
        setIsTouring(false);
        setHighlightRect(null);
        setTourStep(0);
    };

    // Handle Resize/Scroll for Highlight Reposition
    useEffect(() => {
        const handleUpdate = () => {
            if (isTouring && activeSection) {
                const targetId = activeSection.steps[tourStep]?.targetId || activeSection.highlightId;
                if (targetId) {
                    const el = document.querySelector(`[data-help-id="${targetId}"]`);
                    if (el) setHighlightRect(el.getBoundingClientRect());
                }
            }
        };
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);
        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isTouring, activeSection, tourStep]);

    const filteredSections = search
        ? helpSections.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.steps.some(step => step.title.toLowerCase().includes(search.toLowerCase()) || step.text.toLowerCase().includes(search.toLowerCase()))
        )
        : helpSections;

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:w-[540px] bg-zinc-950/98 backdrop-blur-2xl border-l border-zinc-900 text-zinc-100 p-0 flex flex-col z-50 md:rounded-l-3xl shadow-2xl"
                >
                    <div className="absolute top-4 right-4 z-20">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <SheetHeader className="p-6 md:p-8 border-b border-zinc-900/50 bg-zinc-950/50 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                        <div className="flex items-center gap-4 md:gap-6 mb-6 relative z-10">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-none group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-500" />
                                <Mascot status={open ? "thinking" : "idle"} className="w-full h-full relative z-10" />
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase text-indigo-400">
                                    <Bot className="h-3 w-3" /> Online Assistant
                                </div>
                                <SheetTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                                    Edu-Bot Guide
                                </SheetTitle>
                                <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none">Как я могу помочь?</p>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-4 w-4 text-zinc-600" />
                            </div>
                            <Input
                                placeholder="Поиск по функциям..."
                                className="h-10 md:h-11 pl-11 bg-zinc-900/50 border-zinc-800/50 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-white text-sm placeholder:text-zinc-700 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 p-4 md:p-6">
                        <div className="space-y-6">
                            {/* CURRENT PAGE CONTEXT */}
                            {!search && activeSection && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 mb-2"
                                >
                                    <div className="p-4 md:p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Sparkles className="h-12 w-12 text-indigo-500" />
                                        </div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                                                    <Lightbulb className="h-5 w-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Обучение</h3>
                                                    <h4 className="text-base font-bold text-white leading-none">{activeSection.title}</h4>
                                                </div>
                                            </div>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 text-[10px] px-4 font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                                onClick={() => startTour(activeSection)}
                                            >
                                                <PlayCircle className="h-3.5 w-3.5" />
                                                {activeSection.highlightText || "Запустить гид"}
                                            </Button>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            {activeSection.steps.map((step, idx) => (
                                                <div key={idx} className="flex gap-3 items-start group/step">
                                                    <div className="flex-none flex items-center justify-center w-5 h-5 rounded-md bg-zinc-900 text-[10px] font-bold text-indigo-400 border border-zinc-800 mt-0.5 group-hover/step:border-indigo-500/50 transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-zinc-200 mb-0.5">{step.title}</h4>
                                                        <p className="text-[11px] text-zinc-500 leading-relaxed">{step.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ALL SECTIONS */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
                                    {search ? "Результаты поиска" : "Все разделы помощи"}
                                </h3>
                                <div className="grid gap-2">
                                    {filteredSections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section)}
                                            className={`group w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${activeSection?.id === section.id
                                                ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-300"
                                                : "bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-zinc-200"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection?.id === section.id ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-zinc-700"}`} />
                                                <span className="text-sm font-medium">{section.title}</span>
                                            </div>
                                            {section.route === pathname && (
                                                <MapPin className="h-3.5 w-3.5 text-indigo-500/50" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {filteredSections.length === 0 && (
                                    <div className="text-zinc-600 text-center py-12 flex flex-col items-center gap-3">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p className="text-sm font-medium">Ничего не найдено</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Bottom Status */}
                    <div className="p-4 border-t border-zinc-900/50 bg-zinc-950 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Edu-Bot Online</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-700">v1.2.0</span>
                    </div>
                </SheetContent>
            </Sheet>

            {/* TOUR OVERLAY */}
            <AnimatePresence>
                {isTouring && highlightRect && activeSection && (
                    <div className="fixed inset-0 z-[100] pointer-events-none">
                        {/* Dim Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                            onClick={endTour}
                        />

                        {/* Highlight Cutout (Simulated via box-shadow) */}
                        <motion.div
                            layoutId="tour-highlight"
                            className="absolute rounded-2xl border-4 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6),0_0_30px_rgba(129,140,248,0.5)] z-10 transition-all duration-500 ease-in-out"
                            style={{
                                top: highlightRect.top - 8,
                                left: highlightRect.left - 8,
                                width: highlightRect.width + 16,
                                height: highlightRect.height + 16,
                            }}
                        />

                        {/* Tour Info Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute z-20 pointer-events-auto flex flex-col items-center"
                            style={{
                                // Position based on the highlighted element
                                top: highlightRect.bottom + 20 > window.innerHeight - 200
                                    ? highlightRect.top - 220
                                    : highlightRect.bottom + 20,
                                left: Math.max(20, Math.min(window.innerWidth - 300, highlightRect.left + highlightRect.width / 2 - 140)),
                                width: 280
                            }}
                        >
                            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Mascot status="thinking" className="w-8 h-8" />
                                        <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                                            Шаг {tourStep + 1} из {activeSection.steps.length}
                                        </div>
                                    </div>
                                    <button onClick={endTour} className="text-zinc-600 hover:text-white transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <h4 className="text-sm font-black text-white uppercase mb-1 tracking-tight">
                                    {activeSection.steps[tourStep]?.title || activeSection.title}
                                </h4>
                                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                    {activeSection.steps[tourStep]?.text || "Посмотрите на выделенную область."}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-between gap-2 pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={prevStep}
                                        disabled={tourStep === 0}
                                        className="h-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white disabled:opacity-0"
                                    >
                                        <ChevronLeft className="h-3 w-3 mr-1" /> Назад
                                    </Button>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={nextStep}
                                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-1 bg-indigo-600 hover:bg-indigo-500 px-4 min-w-[100px]"
                                    >
                                        {tourStep === activeSection.steps.length - 1 ? (
                                            <>Завершить <CheckCircle2 className="h-3 w-3" /></>
                                        ) : (
                                            <>Далее <ChevronRight className="h-3 w-3" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Arrow Indicator */}
                            <div className={`w-4 h-4 bg-zinc-900 border-l border-t border-zinc-800 rotate-45 -mt-2 ${highlightRect.bottom + 20 > window.innerHeight - 200 ? 'mt-[178px] rotate-[225deg]' : ''}`} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
