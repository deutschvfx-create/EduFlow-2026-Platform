'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    Sparkles, Search, X, MapPin, Bot, Lightbulb, PlayCircle,
    ChevronRight, ChevronLeft, CheckCircle2, FastForward,
    ChevronDown, ChevronUp, Info, Volume2, VolumeX
} from "lucide-react";
import { helpSections, HelpSection } from "@/lib/help-content";
import { Mascot } from "@/components/shared/mascot";
import { useModules } from "@/hooks/use-modules";
import { ModuleKey } from "@/lib/config/modules";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { CursorPuppet } from './cursor-puppet';

export function HelpAssistant() {
    const pathname = usePathname();
    const router = useRouter(); // [SMART NAV]
    const { modules } = useModules(); // [SMART NAV]
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeSection, setActiveSection] = useState<HelpSection | null>(null);

    // Sequential Tour State
    const [isTouring, setIsTouring] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Discovery State
    const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);
    const [hasNewFeatures, setHasNewFeatures] = useState(false);

    // Voice / TTS State
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Smart Navigation State
    const [blockedModule, setBlockedModule] = useState<ModuleKey | null>(null);
    const [pendingTourSection, setPendingTourSection] = useState<HelpSection | null>(null);

    // Puppet State
    const [puppetRect, setPuppetRect] = useState<DOMRect | null>(null);
    const [isPuppetClicking, setIsPuppetClicking] = useState(false);
    const [isPuppetVisible, setIsPuppetVisible] = useState(false);

    // Watch for module enablement
    useEffect(() => {
        if (blockedModule && pendingTourSection && modules[blockedModule]) {
            // Module just enabled!
            if (isVoiceEnabled) {
                speak("Отлично! Модуль включен. Переходим к нему.");
            }

            setBlockedModule(null);

            // Navigate back and start tour
            if (pendingTourSection.route !== pathname) {
                router.push(pendingTourSection.route);
                // Tour will be picked up by checking pendingTourSection in a separate effect or re-triggering
                // But simply calling startTour here might be lost if route changes

                // We need to persist this intention. 
                // Let's rely on the fact we are unlocked now.
                // We can set a timeout to start tour
                setTimeout(() => {
                    startTour(pendingTourSection, true);
                }, 800);
            } else {
                startTour(pendingTourSection, true);
            }
            setPendingTourSection(null);
        }
    }, [modules, blockedModule, pendingTourSection, pathname, isVoiceEnabled]);

    useEffect(() => {
        const voicePref = localStorage.getItem('eduflow_voice_enabled');
        if (voicePref) setIsVoiceEnabled(JSON.parse(voicePref));
    }, []);

    const toggleVoice = () => {
        const next = !isVoiceEnabled;
        setIsVoiceEnabled(next);
        localStorage.setItem('eduflow_voice_enabled', JSON.stringify(next));
        if (!next) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (activeSection && isTouring) {
            // Immediately speak current step if turned on
            const step = activeSection.steps[tourStep];
            if (step) speak(step.title + ". " + step.text);
        }
    };

    const speak = useCallback((text: string) => {
        if (!isVoiceEnabled || typeof window === 'undefined') return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster natural usage
        utterance.pitch = 1.0;

        // Try to find a Russian voice
        const voices = window.speechSynthesis.getVoices();
        const ruVoice = voices.find(v => v.lang.includes('ru')) || voices[0];
        if (ruVoice) utterance.voice = ruVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isVoiceEnabled]);

    // Cleanup speech on unmount or tour end
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Speak when step changes
    useEffect(() => {
        if (isTouring && activeSection) {
            const step = activeSection.steps[tourStep];
            if (step) {
                // [INTERACTIVE STEP]
                if (step.action) {
                    const targetId = step.actionTargetId || step.targetId;
                    if (targetId) {
                        const el = document.querySelector(`[data-help-id="${targetId}"]`);
                        if (el) {
                            setIsPuppetVisible(true);
                            // Move to element
                            // Small delay to ensure layout is stable
                            setTimeout(() => {
                                setPuppetRect(el.getBoundingClientRect());
                            }, 100);

                            // Perform Action
                            if (step.action === 'click') {
                                setTimeout(() => {
                                    setIsPuppetClicking(true);
                                    // Visual click only?
                                    setTimeout(() => {
                                        setIsPuppetClicking(false);
                                        if (!step.preventInteraction) {
                                            (el as HTMLElement).click();
                                        }
                                    }, 400); // Click hold duration
                                }, (step.actionDelay || 1000));
                            } else if (step.action === 'wait') {
                                // Just hover
                            }
                        }
                    }
                } else {
                    // Hide puppet if no action
                    setIsPuppetVisible(false);
                }

                // Small delay to allow transition
                const timer = setTimeout(() => {
                    speak(step.title + ". " + step.text);
                }, 500);
                return () => clearTimeout(timer);
            }
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPuppetVisible(false);
        }
    }, [tourStep, isTouring, activeSection, speak]);

    useEffect(() => {
        const saved = localStorage.getItem('eduflow_discovered_features');
        if (saved) setDiscoveredFeatures(JSON.parse(saved));
    }, []);

    useEffect(() => {
        // Auto-scan for data-help-id on the current page to detect "new" things
        const elements = document.querySelectorAll('[data-help-id]');
        const idsOnPage = Array.from(elements).map(el => el.getAttribute('data-help-id')!);

        // Find if any ID is in helpSections but not in discoveredFeatures
        const allTargetIds = helpSections.flatMap(s => [
            s.highlightId,
            ...s.steps.map(step => step.targetId)
        ]).filter(Boolean) as string[];

        const unseenAvailable = idsOnPage.filter(id =>
            allTargetIds.includes(id) && !discoveredFeatures.includes(id)
        );

        setHasNewFeatures(unseenAvailable.length > 0);
    }, [pathname, discoveredFeatures, open]);

    const markAsDiscovered = (id: string) => {
        if (!id || discoveredFeatures.includes(id)) return;
        const next = [...discoveredFeatures, id];
        setDiscoveredFeatures(next);
        localStorage.setItem('eduflow_discovered_features', JSON.stringify(next));
    };

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
    // Global toggle listener & Hardware Back Button
    useEffect(() => {
        const handleOpenHelp = () => setOpen(true);
        window.addEventListener('open-help', handleOpenHelp);

        return () => window.removeEventListener('open-help', handleOpenHelp);
    }, []);

    // Handle Back Button to Close Sheet
    useEffect(() => {
        if (open) {
            // Push state when opened
            window.history.pushState({ helpOpen: true }, '');

            const handlePopState = (event: PopStateEvent) => {
                // If user presses back, close the sheet
                setOpen(false);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
                // Clean up state if needed, though browser handles pop
            };
        }
    }, [open]);

    const updateHighlight = useCallback((targetId: string) => {
        const el = document.querySelector(`[data-help-id="${targetId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                setHighlightRect(el.getBoundingClientRect());
            }, 400);
        } else {
            console.warn(`Element with data-help-id="${targetId}" not found.`);
            // If target missing, still set null to avoid stale highlights
            setHighlightRect(null);
        }
    }, []);

    const startTour = (section: HelpSection, force = false) => {
        // [SMART NAV] Check Module Lock
        if (!force && section.moduleKey && !modules[section.moduleKey as ModuleKey]) {
            // Module is locked!
            const text = "Этот раздел сейчас отключен в настройках. Я покажу вам, где его включить.";
            if (isVoiceEnabled) speak(text);

            setBlockedModule(section.moduleKey as ModuleKey);
            setPendingTourSection(section);

            setOpen(false); // Close main sheet
            router.push('/app/settings');

            // Highlight the toggle after navigation (using a delay since we don't have route completion event easily)
            setTimeout(() => {
                updateHighlight(`module-toggle-${section.moduleKey}`);
                // Maybe show a small bubble or speak again?
                if (isVoiceEnabled) speak("Включите этот переключатель, чтобы активировать модуль.");
            }, 800);

            return;
        }

        // Standard Tour Start
        if (!force && section.route !== "all" && section.route !== pathname && section.route.startsWith('/app')) {
            const sidebarLinkId = `sidebar-item-${section.route}`;
            let targetEl = document.querySelector(`[data-help-id="${sidebarLinkId}"]`);

            // [HELPER] Function to execute the click with puppet
            const executeClick = (element: Element) => {
                setOpen(false);
                setIsPuppetVisible(true);
                const rect = element.getBoundingClientRect();
                setPuppetRect(rect);
                if (isVoiceEnabled) speak("Переходим в нужный раздел...");

                setTimeout(() => {
                    setIsPuppetClicking(true);
                    setTimeout(() => {
                        setIsPuppetClicking(false);
                        // DO NOT HIDE PUPPET YET - Wait for route change to clear it naturally via unmount or effect
                        // setIsPuppetVisible(false); 
                        (element as HTMLElement).click();

                        // Wait for nav
                        setTimeout(() => {
                            startTour(section, true);
                        }, 1200);
                    }, 400);
                }, 800);
            };

            // 1. Try direct click (Desktop/Visible Link)
            // Check visibility using offsetParent (null if display: none) or zero rect
            const isVisible = (el: Element) => {
                if (!(el instanceof HTMLElement)) return false;
                return el.offsetParent !== null && el.getBoundingClientRect().width > 0;
            };

            // [ALWAYS SHOW HAND] Start by showing hand in center
            setOpen(false);
            setIsPuppetVisible(true);
            setPuppetRect(null); // Triggers center position in CursorPuppet

            // Wait a moment for "Arrival" animation
            setTimeout(() => {
                if (targetEl && isVisible(targetEl)) {
                    executeClick(targetEl);
                    return;
                }

                // 2. Try Mobile Menu Macro
                const mobileMenuTrigger = document.querySelector('[data-help-id="mobile-nav-menu"]');

                // Only try mobile macro if desktop link is NOT visible AND mobile menu trigger IS visible
                if (mobileMenuTrigger && isVisible(mobileMenuTrigger)) {
                    // Step 1: Click Menu
                    // Move hand to menu from center
                    const menuRect = mobileMenuTrigger.getBoundingClientRect();
                    setPuppetRect(menuRect);

                    if (isVoiceEnabled) speak("Открываю меню...");

                    // Move delay
                    setTimeout(() => {
                        setIsPuppetClicking(true);

                        // Click Menu
                        setTimeout(() => {
                            setIsPuppetClicking(false);
                            (mobileMenuTrigger as HTMLElement).click();

                            // Step 2: Wait for Drawer (Needs ample time for animation + DOM mount)
                            setTimeout(() => {
                                if (isVoiceEnabled) speak("Ищу нужный раздел...");

                                // Re-query for link inside drawer
                                // NOTE: We need to wait for AnimatePresence/framer-motion to render children
                                targetEl = document.querySelector(`[data-help-id="${sidebarLinkId}"]`);

                                if (targetEl) {
                                    // SCROLL INTO VIEW (Crucial for mobile)
                                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                    // Wait for scroll to finish
                                    setTimeout(() => {
                                        // Recalculate position after scroll
                                        setPuppetRect(targetEl!.getBoundingClientRect()); // Force non-null assertion as we found it

                                        // Move hand to item
                                        setTimeout(() => {
                                            setIsPuppetClicking(true);

                                            // Click Item
                                            setTimeout(() => {
                                                setIsPuppetClicking(false);
                                                setIsPuppetVisible(false); // Hide hand before nav
                                                (targetEl as HTMLElement).click();

                                                // Wait for route change
                                                setTimeout(() => {
                                                    startTour(section, true);
                                                }, 1500);
                                            }, 500); // Hold click
                                        }, 800); // Move duration
                                    }, 500); // Scroll duration
                                } else {
                                    // Fallback: If still not found (e.g. filtered out?)
                                    console.warn("Target link not found in drawer:", sidebarLinkId);
                                    // Shake animation or just leave?
                                    if (isVoiceEnabled) speak("Не могу найти кнопку меню. Пробую перейти напрямую.");

                                    setIsPuppetVisible(false);
                                    router.push(section.route);
                                    setTimeout(() => startTour(section, true), 800);
                                }
                            }, 1000); // 1s wait for drawer open animation
                        }, 400); // Click duration
                    }, 800); // Initial move duration to menu

                    return;
                }

                // Fallback: If nothing works
                if (isVoiceEnabled) speak("Перехожу в раздел.");
                setIsPuppetVisible(false);
                router.push(section.route);
                setTimeout(() => {
                    startTour(section, true);
                }, 800);
            }, 500); // Initial appearance delay

            return;
        }

        setOpen(false);
        setIsTouring(true);
        setTourStep(0);
        setIsExpanded(false);

        const firstStep = section.steps[0];
        const targetId = firstStep?.targetId || section.highlightId;

        if (targetId) {
            updateHighlight(targetId);
            markAsDiscovered(targetId);
        }
    };

    const nextStep = () => {
        if (!activeSection) return;
        const nextIdx = tourStep + 1;
        setIsExpanded(false);
        if (nextIdx < activeSection.steps.length) {
            setTourStep(nextIdx);
            const targetId = activeSection.steps[nextIdx].targetId;
            if (targetId) {
                updateHighlight(targetId);
                markAsDiscovered(targetId);
            }
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (!activeSection || tourStep === 0) return;
        const prevIdx = tourStep - 1;
        setTourStep(prevIdx);
        setIsExpanded(false);
        const targetId = activeSection.steps[prevIdx].targetId;
        if (targetId) updateHighlight(targetId);
    };

    const endTour = () => {
        setIsTouring(false);
        setHighlightRect(null);
        setTourStep(0);
        setIsExpanded(false);
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

    const filteredSections = useMemo(() => {
        return search
            ? helpSections.filter(s =>
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.steps.some(step => step.title.toLowerCase().includes(search.toLowerCase()) || step.text.toLowerCase().includes(search.toLowerCase()))
            )
            : helpSections;
    }, [search]);

    // Calculate spotlight CSS variables with Glow intensity
    const spotlightVars = useMemo(() => {
        if (!highlightRect) return {};
        const x = highlightRect.left + highlightRect.width / 2;
        const y = highlightRect.top + highlightRect.height / 2;
        const r = Math.max(highlightRect.width, highlightRect.height) / 2 + 15;
        const glow = r + 40; // Soft transition area
        return {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--r': `${r}px`,
            '--glow': `${glow}px`
        } as React.CSSProperties;
    }, [highlightRect]);

    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-[85vw] sm:w-[540px] bg-zinc-950/98 backdrop-blur-2xl border-l border-zinc-900 text-zinc-100 p-0 flex flex-col z-[100] md:rounded-l-3xl shadow-2xl h-full"
                >
                    <div className="absolute top-4 right-4 z-20">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <SheetHeader className="p-4 md:p-8 border-b border-zinc-900/50 bg-zinc-950/50 relative overflow-hidden flex-none">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-6 relative z-10">
                            <div className="relative w-12 h-12 md:w-20 md:h-20 flex-none group">
                                <div className={`absolute inset-0 blur-2xl rounded-full transition-all duration-500 ${hasNewFeatures ? 'bg-indigo-500/40 animate-discovery-glow' : 'bg-indigo-500/20 group-hover:bg-indigo-500/30'}`} />
                                <Mascot status={open ? "thinking" : (hasNewFeatures ? "surprised" : "idle")} className="w-12 h-12 md:w-full md:h-full relative z-10" />
                                {hasNewFeatures && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-zinc-950 flex items-center justify-center animate-bounce z-20">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                )}
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

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                        <div className="space-y-6 pb-20">
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
                                                {section.moduleKey && !modules[section.moduleKey as ModuleKey] && (
                                                    <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Выкл</span>
                                                )}
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
                    </div>

                    {/* Bottom Status */}
                    <div className="p-4 border-t border-zinc-900/50 bg-zinc-950 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Edu-Bot Online</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-700">v1.2.5</span>
                    </div>
                </SheetContent>
            </Sheet>

            {/* TOUR OVERLAY */}
            <AnimatePresence>
                {isTouring && highlightRect && activeSection && (
                    <div className="fixed inset-0 z-[100] pointer-events-none">
                        {/* Premium Spotlight Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-[1px] pointer-events-auto cursor-crosshair"
                            style={{
                                ...spotlightVars,
                                maskImage: `radial-gradient(circle at var(--x) var(--y), transparent var(--r), black var(--glow))`
                            } as any}
                            onClick={endTour}
                        />

                        {/* Highlight Border with Pulse */}
                        <motion.div
                            layoutId="tour-highlight"
                            className="absolute rounded-2xl border-[3px] border-indigo-400 z-10 animate-pulse-indigo shadow-[0_0_30px_rgba(129,140,248,0.4)] pointer-events-none"
                            style={{
                                top: highlightRect.top - 12,
                                left: highlightRect.left - 12,
                                width: highlightRect.width + 24,
                                height: highlightRect.height + 24,
                            }}
                        />

                        {/* Tooltip Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute z-20 pointer-events-auto flex flex-col items-center max-w-[90vw] sm:max-w-none"
                            style={{
                                top: highlightRect.bottom + 40 > window.innerHeight - 250
                                    ? highlightRect.top - (isExpanded ? 380 : 280)
                                    : highlightRect.bottom + 40,
                                left: Math.max(10, Math.min(window.innerWidth - 310, highlightRect.left + highlightRect.width / 2 - 150)),
                                width: 300
                            }}
                        >
                            <div className="w-full bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.1)] p-6 overflow-hidden relative group">
                                {/* Top Glow */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                                {/* Progress Indicator */}
                                <div className="absolute top-0 left-0 h-[2px] bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${((tourStep + 1) / activeSection.steps.length) * 100}%` }} />

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full" />
                                            <Mascot status={isSpeaking ? "speaking" : "thinking"} className="w-10 h-10 relative z-10" />
                                            {isSpeaking && (
                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex gap-0.5 h-3 items-center">
                                                    <div className="sound-bar" style={{ animationDelay: '0s' }} />
                                                    <div className="sound-bar" style={{ animationDelay: '0.2s' }} />
                                                    <div className="sound-bar" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-tighter self-start mb-1">
                                                Шаг {tourStep + 1} из {activeSection.steps.length}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={toggleVoice}
                                            className={`p-1.5 rounded-full transition-colors ${isVoiceEnabled ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            title={isVoiceEnabled ? "Выключить озвучку" : "Включить озвучку"}
                                        >
                                            {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                        </button>
                                        <button onClick={endTour} className="text-zinc-600 hover:text-white transition-colors p-1.5 rounded-full hover:bg-zinc-800">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <motion.div
                                    key={tourStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h4 className="text-sm font-black text-white uppercase mb-1.5 tracking-tight flex items-center gap-2">
                                        {activeSection.steps[tourStep]?.title || activeSection.title}
                                        <Sparkles className="h-3 w-3 text-amber-400" />
                                    </h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                        {activeSection.steps[tourStep]?.text}
                                    </p>

                                    {activeSection.steps[tourStep]?.tip && (
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 mb-4 flex gap-2">
                                            <Lightbulb className="h-3.5 w-3.5 text-emerald-500 flex-none mt-0.5" />
                                            <p className="text-[10px] font-medium text-emerald-400 italic">
                                                {activeSection.steps[tourStep].tip}
                                            </p>
                                        </div>
                                    )}

                                    {activeSection.steps[tourStep]?.details && (
                                        <div className="mb-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsExpanded(!isExpanded)}
                                                className="w-full justify-between h-8 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 p-0"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Info className="h-3 w-3" />
                                                    {isExpanded ? "Свернуть" : "Подробнее"}
                                                </span>
                                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </Button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-2 pb-1 border-t border-zinc-800/50 mt-2">
                                                            <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                                                {activeSection.steps[tourStep].details}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={prevStep}
                                            disabled={tourStep === 0}
                                            className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-0 rounded-xl"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={endTour}
                                            className="h-9 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white hover:bg-zinc-800/50 rounded-xl px-3"
                                        >
                                            Пропустить
                                        </Button>
                                    </div>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            if (tourStep === activeSection.steps.length - 1) {
                                                triggerConfetti();
                                                setTimeout(endTour, 1000);
                                            } else {
                                                nextStep();
                                            }
                                        }}
                                        className="h-9 text-[11px] font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 min-w-[110px] rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        {tourStep === activeSection.steps.length - 1 ? (
                                            <>Готово <CheckCircle2 className="h-3.5 w-3.5" /></>
                                        ) : (
                                            <>Далее <ChevronRight className="h-3.5 w-3.5" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Confetti Burst Overlay */}
                            {showConfetti && (
                                <div className="absolute inset-0 pointer-events-none z-30">
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: 150, y: 150, opacity: 1, scale: 1 }}
                                            animate={{
                                                x: 150 + (Math.random() - 0.5) * 300,
                                                y: 150 + (Math.random() - 0.5) * 300,
                                                opacity: 0,
                                                scale: 0.5
                                            }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="absolute w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#10b981'][i % 4],
                                                left: 0,
                                                top: 0
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Arrow Indicator */}
                            <div className={`w-5 h-5 bg-zinc-900 border-l border-t border-zinc-800/50 rotate-45 -mt-2.5 relative z-10 ${highlightRect.bottom + 40 > window.innerHeight - 250 ? 'mt-[238px] rotate-[225deg]' : ''}`} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CURSOR PUPPET */}
            <CursorPuppet
                targetRect={puppetRect}
                isClicking={isPuppetClicking}
                isVisible={isPuppetVisible}
            />
        </>
    );
}
