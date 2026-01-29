'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Search, X, MapPin, ExternalLink, MousePointerClick, Bot, Lightbulb, PlayCircle } from "lucide-react";
import { helpSections, HelpSection } from "@/lib/help-content";
import { Mascot } from "@/components/shared/mascot";
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function HelpAssistant() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightElement, setHighlightElement] = useState<{ rect: DOMRect, text: string } | null>(null);
    const [activeSection, setActiveSection] = useState<HelpSection | null>(null);

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

    // Handle Resize for Highlight Reposition
    useEffect(() => {
        const handleResize = () => setHighlightElement(null);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleHighlight = (id: string, text: string) => {
        setOpen(false); // Close drawer to show highlight
        setTimeout(() => {
            const el = document.querySelector(`[data-help-id="${id}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Wait for scroll
                setTimeout(() => {
                    const rect = el.getBoundingClientRect();
                    setHighlightElement({ rect, text });
                }, 500);
            } else {
                alert("Element not found on this page.");
                setOpen(true);
            }
        }, 100);
    };

    const clearHighlight = () => {
        setHighlightElement(null);
    };

    const filteredSections = search
        ? helpSections.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.steps.some(step => step.title.toLowerCase().includes(search.toLowerCase()) || step.text.toLowerCase().includes(search.toLowerCase()))
        )
        : helpSections;

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950/95 backdrop-blur-xl border-l-zinc-800 text-zinc-100 p-0 flex flex-col z-50">
                    <div className="absolute top-0 right-0 p-4 z-10">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full hover:bg-white/10">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <SheetHeader className="p-8 border-b border-zinc-800/50 bg-zinc-900/30">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-24 h-24 flex-none">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                                <Mascot status={open ? "thinking" : "idle"} className="w-full h-full relative z-10" />
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black uppercase text-indigo-400">
                                    <Bot className="h-3 w-3" /> Online Assistant
                                </div>
                                <SheetTitle className="text-3xl font-black text-white uppercase tracking-tight">
                                    Edu-Bot Guide
                                </SheetTitle>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-none">Как я могу помочь?</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Search className="h-4 w-4 text-zinc-600" />
                            </div>
                            <Input
                                placeholder="Поиск по функциям..."
                                className="h-12 pl-12 bg-zinc-950 border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-white font-medium placeholder:text-zinc-700 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {/* CURRENT PAGE CONTEXT */}
                            {!search && activeSection && (
                                <div className="space-y-4 mb-4">
                                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                    <Lightbulb className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Инструкция</h3>
                                                    <h4 className="text-sm font-bold text-white">{activeSection.title}</h4>
                                                </div>
                                            </div>
                                            {activeSection.highlightId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-[10px] px-3 font-black uppercase tracking-widest gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                                                    onClick={() => handleHighlight(activeSection.highlightId!, activeSection.highlightText || "Здесь")}
                                                >
                                                    <PlayCircle className="h-3.5 w-3.5" />
                                                    Показать
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {activeSection.steps.map((step, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-medium text-zinc-400 border border-zinc-700">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-zinc-200">{step.title}</h4>
                                                        <p className="text-sm text-zinc-400">{step.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {activeSection.images && activeSection.images.map((img, i) => (
                                                <div key={i} className="mt-2 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                                                    <div className="relative w-full aspect-video bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                                                        <span className="z-10 bg-black/50 px-2 py-1 rounded">{img.caption}</span>
                                                        <img
                                                            src={img.src}
                                                            alt={img.caption}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ALL SECTIONS */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                                    {search ? "Результаты поиска" : "Все разделы"}
                                </h3>
                                {filteredSections.map(section => (
                                    <div key={section.id} className="group">
                                        <button
                                            onClick={() => setActiveSection(section)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${activeSection?.id === section.id
                                                ? "bg-indigo-900/20 border-indigo-500/50 text-indigo-300"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                                                }`}
                                        >
                                            <span className="font-medium">{section.title}</span>
                                            {section.route === pathname && (
                                                <MapPin className="h-3 w-3 text-indigo-500" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                                {filteredSections.length === 0 && (
                                    <div className="text-zinc-500 text-center py-8">Ничего не найдено</div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* HIGHLIGHT OVERLAY */}
            {highlightElement && (
                <div
                    className="fixed inset-0 z-[60] bg-black/70 animate-in fade-in duration-300"
                    onClick={clearHighlight}
                >
                    <div
                        className="absolute shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-lg transition-all duration-500 ease-in-out border-2 border-indigo-500 shadow-indigo-500/50"
                        style={{
                            top: (highlightElement?.rect?.top ?? 0) - 4,
                            left: (highlightElement?.rect?.left ?? 0) - 4,
                            width: (highlightElement?.rect?.width ?? 0) + 8,
                            height: (highlightElement?.rect?.height ?? 0) + 8,
                        }}
                    >
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shadow-lg animate-bounce">
                            {highlightElement.text}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-indigo-600" />
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center">
                        <p className="text-lg font-semibold">Нажмите в любом месте, чтобы закрыть</p>
                    </div>
                </div>
            )}
        </>
    );
}
