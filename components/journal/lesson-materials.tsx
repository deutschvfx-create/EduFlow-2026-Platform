'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Paperclip, Link as LinkIcon, FileText, Globe, Plus, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
    id: string;
    title: string;
    url: string;
    type: "LINK" | "FILE";
    createdAt: string;
}

interface LessonMaterialsProps {
    lessonId: string;
}

export function LessonMaterials({ lessonId }: LessonMaterialsProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (!newTitle.trim() || !newUrl.trim()) return;

        const material: Material = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTitle,
            url: newUrl,
            type: newUrl.startsWith("http") ? "LINK" : "FILE",
            createdAt: new Date().toISOString()
        };

        setMaterials([material, ...materials]);
        setNewTitle("");
        setNewUrl("");
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-50 rounded-lg">
                        <Paperclip className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[hsl(var(--foreground))]">Материалы занятия</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Файлы и ссылки, доступные студентам</p>
                    </div>
                </div>
                {!isAdding && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-primary hover:bg-primary/90 text-foreground rounded-xl h-10 px-4 font-bold text-xs gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Добавить
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-white border-none shadow-md overflow-hidden rounded-2xl ring-2 ring-cyan-500/20">
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Название материала</label>
                            <Input
                                placeholder="Например: Презентация к уроку 5"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="h-11 bg-[hsl(var(--secondary))] border-none focus-visible:ring-indigo-500 rounded-xl text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Ссылка или путь к файлу</label>
                            <Input
                                placeholder="https://example.com/slide.pdf"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="h-11 bg-[hsl(var(--secondary))] border-none focus-visible:ring-indigo-500 rounded-xl text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAdding(false)}
                                className="h-10 px-5 text-[hsl(var(--muted-foreground))] font-bold text-xs hover:bg-[hsl(var(--secondary))]"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleAdd}
                                disabled={!newTitle.trim() || !newUrl.trim()}
                                className="h-10 px-6 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-xl text-xs gap-2 shadow-sm"
                            >
                                Сохранить
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-3">
                {materials.length > 0 ? (
                    materials.map((m) => (
                        <div
                            key={m.id}
                            className="group p-4 rounded-2xl bg-white border border-[hsl(var(--border))] hover:border-cyan-200 transition-all flex items-center gap-4"
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                m.type === "LINK" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                                {m.type === "LINK" ? <Globe className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[hsl(var(--foreground))] truncate">{m.title}</h4>
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium truncate opacity-70">{m.url}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={m.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-primary hover:bg-cyan-50 transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-[hsl(var(--muted-foreground))] hover:text-red-600 hover:bg-red-50 rounded-xl"
                                    onClick={() => setMaterials(materials.filter(item => item.id !== m.id))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="py-16 border-2 border-dashed border-[hsl(var(--border))] rounded-3xl flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))] flex items-center justify-center mb-4">
                                <Paperclip className="h-8 w-8 text-cyan-200" />
                            </div>
                            <h4 className="text-[hsl(var(--foreground))] font-bold mb-1">Нет материалов</h4>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-[200px]">Добавьте полезные ссылки или файлы для студентов этого курса</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
