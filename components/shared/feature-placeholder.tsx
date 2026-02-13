'use client';

import { useState, useEffect } from "react";
import {
    Construction,
    Info,
    Lightbulb,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    ArrowRight,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Idea {
    id: string;
    text: string;
    createdAt: number;
}

interface FeaturePlaceholderProps {
    featureName: string;
    plannedFeatures: string[];
    benefits: string[];
    variant?: "full" | "button" | "section";
    className?: string;
}

export function FeaturePlaceholder({
    featureName,
    plannedFeatures,
    benefits,
    variant = "full",
    className = ""
}: FeaturePlaceholderProps) {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [newIdea, setNewIdea] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Load ideas from localStorage on mount
    useEffect(() => {
        const savedIdeas = localStorage.getItem(`ideas-${featureName}`);
        if (savedIdeas) {
            try {
                setIdeas(JSON.parse(savedIdeas));
            } catch (e) {
                console.error("Failed to parse ideas", e);
            }
        }
    }, [featureName]);

    // Save ideas to localStorage
    const saveIdeas = (updatedIdeas: Idea[]) => {
        setIdeas(updatedIdeas);
        localStorage.setItem(`ideas-${featureName}`, JSON.stringify(updatedIdeas));
    };

    const addIdea = () => {
        if (!newIdea.trim()) return;
        const idea: Idea = {
            id: Math.random().toString(36).substr(2, 9),
            text: newIdea.trim(),
            createdAt: Date.now(),
        };
        saveIdeas([idea, ...ideas]);
        setNewIdea("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const deleteIdea = (id: string) => {
        saveIdeas(ideas.filter(i => i.id !== id));
    };

    const startEditing = (idea: Idea) => {
        setEditingId(idea.id);
        setEditText(idea.text);
    };

    const saveEdit = () => {
        if (!editText.trim() || !editingId) return;
        saveIdeas(ideas.map(i => i.id === editingId ? { ...i, text: editText.trim() } : i));
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const content = (
        <div className={`relative group overflow-hidden rounded-3xl border border-dashed border-border bg-secondary/20 p-8 text-center transition-all hover:bg-secondary/40 ${className}`}>
            <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 animate-pulse">
                    В разработке
                </Badge>
            </div>

            <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center relative">
                    <Construction className="h-8 w-8 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-background shadow-lg">
                        <Clock className="h-3.5 w-3.5" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground tracking-tight uppercase tracking-widest">{featureName}</h3>
                    <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                        Мы проектируем мощный инструмент для {featureName.toLowerCase()}. Эта функция скоро станет доступной для вашего аккаунта.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-border bg-secondary/50 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest py-6 h-auto transition-all hover:scale-[1.02]">
                                <Info className="mr-2 h-4 w-4" /> Узнать подробнее
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border text-foreground max-w-2xl rounded-3xl overflow-hidden p-0 gap-0 shadow-2xl">
                            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 w-full" />
                            <div className="p-8 space-y-8">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Роадмап: {featureName}</DialogTitle>
                                            <DialogDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">Будущие возможности и преимущества</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <Construction className="h-4 w-4 text-amber-500" /> Что появится:
                                        </h4>
                                        <ul className="space-y-3">
                                            {plannedFeatures.map((f, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-muted-foreground font-medium">
                                                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-muted-foreground/50 font-black">
                                                        {i + 1}
                                                    </div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Преимущества:
                                        </h4>
                                        <div className="grid gap-3">
                                            {benefits.map((b, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-background/40 border border-border flex gap-3 group/item hover:border-emerald-500/30 transition-colors">
                                                    <div className="h-5 w-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium group-hover/item:text-foreground transition-colors">{b}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Ideas Section */}
                                <div className="pt-8 border-t border-border space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Ваши идеи</h4>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Помогите нам сделать функцию еще лучше</p>
                                        </div>
                                        <AnimatePresence>
                                            {showSuccess && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Сохранено!
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex gap-2">
                                        <Textarea
                                            placeholder="У меня есть идея..."
                                            value={newIdea}
                                            onChange={(e) => setNewIdea(e.target.value)}
                                            className="bg-background/50 border-border rounded-2xl min-h-[50px] text-foreground placeholder:text-muted-foreground/30 resize-none text-xs p-4"
                                        />
                                        <Button
                                            onClick={addIdea}
                                            disabled={!newIdea.trim()}
                                            className="h-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl aspect-square"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        <AnimatePresence initial={false}>
                                            {ideas.map((idea) => (
                                                <motion.div
                                                    key={idea.id}
                                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    className="p-4 rounded-2xl bg-background/30 border border-border flex group relative"
                                                >
                                                    {editingId === idea.id ? (
                                                        <div className="space-y-3">
                                                            <Textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="bg-background border-border min-h-[40px] text-xs p-2"
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Отмена</Button>
                                                                <Button size="sm" onClick={saveEdit} className="h-7 bg-emerald-600 hover:bg-emerald-500 text-foreground text-[10px] font-black uppercase tracking-widest px-4 rounded-lg">Сохранить</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-foreground/80 font-medium leading-relaxed">{idea.text}</p>
                                                                <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                                                    {new Date(idea.createdAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button size="icon" variant="ghost" onClick={() => startEditing(idea)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" onClick={() => deleteIdea(idea.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {ideas.length === 0 && (
                                            <div className="text-center py-6 space-y-2">
                                                <Lightbulb className="h-6 w-6 text-zinc-800 mx-auto" />
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                                                    Идей пока нет.<br />Станьте первым, кто предложит улучшение!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-background/40 border-t border-border text-center">
                                <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">Ваш вклад важен для развития EduFlow 2.0</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );

    return content;
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
