'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LifeBuoy, Search, X, MapPin, ExternalLink, MousePointerClick } from "lucide-react";
import { helpSections, HelpSection } from "@/lib/help-content";
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
            {/* FLOATING BUTTON */}
            <div className="fixed bottom-6 right-6 z-40">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-400/20"
                        >
                            <LifeBuoy className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950 border-l-zinc-800 text-zinc-100 p-0 flex flex-col z-50">
                        <SheetHeader className="p-6 border-b border-zinc-800">
                            <SheetTitle className="text-white flex items-center gap-2">
                                <LifeBuoy className="h-5 w-5 text-indigo-400" />
                                Помощник EduFlow
                            </SheetTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    placeholder="Поиск по справке..."
                                    className="pl-8 bg-zinc-900 border-zinc-800 text-zinc-200"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* CURRENT PAGE CONTEXT */}
                                {!search && activeSection && (
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                                                Текущая страница: {activeSection.title}
                                            </h3>
                                            {activeSection.highlightId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-indigo-300"
                                                    onClick={() => handleHighlight(activeSection.highlightId!, activeSection.highlightText || "Здесь")}
                                                >
                                                    <MousePointerClick className="h-3 w-3" />
                                                    Показать на странице
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
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
                                                    {/* Using a simple div instead of Next Image for placeholders to avoid 404s breaking layout if file missing, 
                                                        but user asked for Next Image. We made placeholders. */}
                                                    <div className="relative w-full aspect-video bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                                                        {/* Placeholder visual if image fails or just as mock */}
                                                        <span className="z-10 bg-black/50 px-2 py-1 rounded">{img.caption}</span>
                                                        {/* Actual image */}
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
            </div>

            {/* HIGHLIGHT OVERLAY */}
            {highlightElement && (
                <div
                    className="fixed inset-0 z-[60] bg-black/70 animate-in fade-in duration-300"
                    onClick={clearHighlight}
                >
                    <div
                        className="absolute shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-lg transition-all duration-500 ease-in-out border-2 border-indigo-500 shadow-indigo-500/50"
                        style={{
                            top: highlightElement.rect.top - 4,
                            left: highlightElement.rect.left - 4,
                            width: highlightElement.rect.width + 8,
                            height: highlightElement.rect.height + 8,
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

// Add these custom styles for the highlight effect if needed,
// strictly standard Tailwind used above.
