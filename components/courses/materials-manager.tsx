'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CourseMaterial } from "@/lib/types/course";
import { generateId } from "@/lib/utils";
import { Plus, File, Link as LinkIcon, Video, Trash2, Download, Eye, EyeOff, Users, GraduationCap, UserCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MaterialsManagerProps {
    materials: CourseMaterial[];
    onUpdate: (materials: CourseMaterial[]) => void;
}

export function MaterialsManager({ materials, onUpdate }: MaterialsManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Partial<CourseMaterial>>({
        type: "FILE",
        accessLevel: "STUDENTS"
    });

    const handleAdd = () => {
        if (!newMaterial.title || !newMaterial.url) return;

        const material: CourseMaterial = {
            id: generateId(),
            type: newMaterial.type as any,
            title: newMaterial.title,
            description: newMaterial.description,
            url: newMaterial.url,
            accessLevel: newMaterial.accessLevel as any,
            uploadedAt: new Date().toISOString(),
            uploadedBy: "current-user" // TODO: Get from auth context
        };

        onUpdate([...materials, material]);
        setNewMaterial({ type: "FILE", accessLevel: "STUDENTS" });
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Удалить этот материал?")) return;
        onUpdate(materials.filter(m => m.id !== id));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "FILE": return <File className="h-4 w-4" />;
            case "LINK": return <LinkIcon className="h-4 w-4" />;
            case "VIDEO": return <Video className="h-4 w-4" />;
            default: return <File className="h-4 w-4" />;
        }
    };

    const getAccessIcon = (level: string) => {
        switch (level) {
            case "TEACHERS": return <GraduationCap className="h-3 w-3" />;
            case "STUDENTS": return <Users className="h-3 w-3" />;
            case "PARENTS": return <UserCircle className="h-3 w-3" />;
            case "PUBLIC": return <Eye className="h-3 w-3" />;
            default: return <EyeOff className="h-3 w-3" />;
        }
    };

    const accessLevelColors = {
        TEACHERS: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        STUDENTS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        PARENTS: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        PUBLIC: "bg-green-500/20 text-green-300 border-green-500/30"
    };

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="text-sm text-muted-foreground">
                    Всего материалов: <span className="font-semibold text-foreground">{materials.length}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>📄 {materials.filter(m => m.type === 'FILE').length}</span>
                    <span>🔗 {materials.filter(m => m.type === 'LINK').length}</span>
                    <span>🎥 {materials.filter(m => m.type === 'VIDEO').length}</span>
                </div>
            </div>

            {/* Materials List */}
            <div className="space-y-2">
                {materials.map((material) => (
                    <Card key={material.id} className="bg-card/30 border-border/50 hover:border-border/50 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-secondary/50 rounded-lg text-muted-foreground">
                                    {getTypeIcon(material.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-foreground truncate">{material.title}</h4>
                                        <Badge variant="outline" className={`text-xs ${accessLevelColors[material.accessLevel as keyof typeof accessLevelColors]}`}>
                                            <span className="flex items-center gap-1">
                                                {getAccessIcon(material.accessLevel)}
                                                {material.accessLevel === 'TEACHERS' ? 'Преподаватели' :
                                                    material.accessLevel === 'STUDENTS' ? 'Студенты' :
                                                        material.accessLevel === 'PARENTS' ? 'Родители' : 'Публично'}
                                            </span>
                                        </Badge>
                                    </div>
                                    {material.description && (
                                        <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="font-mono bg-secondary/30 px-2 py-0.5 rounded">{material.type}</span>
                                        <span>{new Date(material.uploadedAt).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => window.open(material.url, '_blank')}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(material.id)}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {materials.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-muted-foreground">
                        <File className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">Материалы отсутствуют</p>
                        <p className="text-sm text-muted-foreground mt-1">Добавьте файлы, ссылки или видео</p>
                    </div>
                )}
            </div>

            {/* Add New */}
            {isAdding ? (
                <Card className="bg-card/50 border-border border-dashed">
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Тип материала *</Label>
                                <Select value={newMaterial.type} onValueChange={(v) => setNewMaterial({ ...newMaterial, type: v as any })}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FILE">📄 Файл</SelectItem>
                                        <SelectItem value="LINK">🔗 Ссылка</SelectItem>
                                        <SelectItem value="VIDEO">🎥 Видео</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold">Доступ *</Label>
                                <Select value={newMaterial.accessLevel} onValueChange={(v) => setNewMaterial({ ...newMaterial, accessLevel: v as any })}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TEACHERS">👨‍🏫 Преподаватели</SelectItem>
                                        <SelectItem value="STUDENTS">👥 Студенты</SelectItem>
                                        <SelectItem value="PARENTS">👪 Родители</SelectItem>
                                        <SelectItem value="PUBLIC">🌐 Публично</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">Название *</Label>
                            <Input
                                value={newMaterial.title || ""}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                className="bg-background border-border"
                                placeholder="Например: Лекция 1 - Введение"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">URL / Путь к файлу *</Label>
                            <Input
                                value={newMaterial.url || ""}
                                onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                className="bg-background border-border"
                                placeholder="https://... или /files/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold">Описание</Label>
                            <Textarea
                                value={newMaterial.description || ""}
                                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                className="bg-background border-border resize-none h-16"
                                placeholder="Краткое описание материала..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
                                <Plus className="mr-2 h-4 w-4" /> Добавить
                            </Button>
                            <Button variant="ghost" onClick={() => { setIsAdding(false); setNewMaterial({ type: "FILE", accessLevel: "STUDENTS" }); }}>
                                Отмена
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
                    <Plus className="mr-2 h-4 w-4" /> Добавить материал
                </Button>
            )}
        </div>
    );
}
