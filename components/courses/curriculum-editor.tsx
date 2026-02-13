'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { CourseModule } from "@/lib/types/course";
import { generateId } from "@/lib/utils";

interface CurriculumEditorProps {
    modules: CourseModule[];
    onUpdate: (modules: CourseModule[]) => void;
}

export function CurriculumEditor({ modules, onUpdate }: CurriculumEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newModule, setNewModule] = useState<Partial<CourseModule>>({});
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (!newModule.title || !newModule.hours) return;

        const module: CourseModule = {
            id: generateId(),
            title: newModule.title,
            description: newModule.description || undefined,
            hours: newModule.hours,
            order: modules.length
        };

        onUpdate([...modules, module]);
        setNewModule({});
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Удалить этот модуль?")) return;
        onUpdate(modules.filter(m => m.id !== id));
    };

    const handleUpdate = (id: string, updates: Partial<CourseModule>) => {
        onUpdate(modules.map(m => m.id === id ? { ...m, ...updates } : m));
        setEditingId(null);
    };

    const totalHours = modules.reduce((sum, m) => sum + (m.hours || 0), 0);

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="text-sm text-muted-foreground">
                    Всего модулей: <span className="font-semibold text-foreground">{modules.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Всего часов: <span className="font-semibold text-foreground">{totalHours}</span>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-2">
                {modules.map((module, index) => (
                    <Card key={module.id} className="bg-card/30 border-border/50">
                        <CardContent className="p-4">
                            {editingId === module.id ? (
                                <div className="space-y-3">
                                    <Input
                                        defaultValue={module.title}
                                        className="bg-background border-border"
                                        placeholder="Название модуля"
                                        onBlur={(e) => handleUpdate(module.id, { title: e.target.value })}
                                    />
                                    <Textarea
                                        defaultValue={module.description}
                                        className="bg-background border-border resize-none h-16"
                                        placeholder="Описание (опционально)"
                                        onBlur={(e) => handleUpdate(module.id, { description: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            defaultValue={module.hours}
                                            className="bg-background border-border w-24"
                                            placeholder="Часы"
                                            onBlur={(e) => handleUpdate(module.id, { hours: parseInt(e.target.value) || 0 })}
                                        />
                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-green-400 hover:text-green-300">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-move" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">#{index + 1}</span>
                                            <h4 className="font-medium text-foreground">{module.title}</h4>
                                            <span className="text-xs text-muted-foreground ml-auto">{module.hours} ч</span>
                                        </div>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{module.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(module.id)} className="text-muted-foreground hover:text-foreground">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(module.id)} className="text-muted-foreground hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add New */}
            {isAdding ? (
                <Card className="bg-card/30 border-border/50 border-dashed">
                    <CardContent className="p-4 space-y-3">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">Название модуля *</Label>
                            <Input
                                value={newModule.title || ""}
                                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                className="bg-background border-border"
                                placeholder="Например: Введение в грамматику"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">Описание</Label>
                            <Textarea
                                value={newModule.description || ""}
                                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                className="bg-background border-border resize-none h-16"
                                placeholder="Краткое описание модуля..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">Часов *</Label>
                            <Input
                                type="number"
                                min="0"
                                value={newModule.hours || ""}
                                onChange={(e) => setNewModule({ ...newModule, hours: parseInt(e.target.value) || 0 })}
                                className="bg-background border-border w-32"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
                                <Check className="mr-2 h-4 w-4" /> Добавить
                            </Button>
                            <Button variant="ghost" onClick={() => { setIsAdding(false); setNewModule({}); }}>
                                <X className="mr-2 h-4 w-4" /> Отмена
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    variant="outline"
                    className="w-full border-border border-dashed hover:bg-secondary/50 text-muted-foreground"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> Добавить модуль
                </Button>
            )}
        </div>
    );
}
