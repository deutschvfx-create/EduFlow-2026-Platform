'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GradingConfig, GradingType } from "@/lib/types/course";
import { Edit2, Check, X, AlertCircle } from "lucide-react";

interface GradingConfiguratorProps {
    grading: GradingConfig;
    onUpdate: (grading: GradingConfig) => void;
}

export function GradingConfigurator({ grading, onUpdate }: GradingConfiguratorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<GradingConfig>(grading);

    const handleSave = () => {
        // Validate weights sum to 100
        const total = Object.values(draft.weights).reduce((sum, val) => sum + val, 0);
        if (total !== 100) {
            alert(`Сумма весов должна быть 100%, сейчас: ${total}%`);
            return;
        }
        onUpdate(draft);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraft(grading);
        setIsEditing(false);
    };

    const weightsTotal = Object.values(draft.weights).reduce((sum, val) => sum + val, 0);
    const isValidWeights = weightsTotal === 100;

    const gradingTypeLabels: Record<GradingType, string> = {
        '5_POINT': '5-балльная',
        '10_POINT': '10-балльная',
        'A_F': 'A-F (буквенная)',
        'PERCENTAGE': 'Проценты (0-100)'
    };

    if (!isEditing) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Система оценивания</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-border hover:bg-secondary">
                        <Edit2 className="mr-2 h-4 w-4" /> Изменить
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Тип системы</div>
                        <Badge variant="secondary" className="bg-secondary/50 text-foreground">
                            {gradingTypeLabels[grading.type]}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Округление</div>
                        <div className="text-foreground text-sm">
                            {grading.rounding === 'UP' ? 'Вверх' : grading.rounding === 'DOWN' ? 'Вниз' : 'К ближайшему'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Минимальный балл</div>
                        <div className="text-foreground text-sm font-medium">{grading.minPassScore}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Веса оценок</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm text-muted-foreground">Экзамены</span>
                            <span className="text-sm font-semibold text-foreground">{grading.weights.exams}%</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm text-muted-foreground">Контрольные</span>
                            <span className="text-sm font-semibold text-foreground">{grading.weights.control}%</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm text-muted-foreground">Домашние</span>
                            <span className="text-sm font-semibold text-foreground">{grading.weights.homework}%</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm text-muted-foreground">Активность</span>
                            <span className="text-sm font-semibold text-foreground">{grading.weights.participation}%</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-card/50 border-border">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Редактирование системы</h3>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                            <Check className="mr-2 h-4 w-4" /> Сохранить
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" /> Отмена
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Тип системы</Label>
                        <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as GradingType })}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5_POINT">5-балльная</SelectItem>
                                <SelectItem value="10_POINT">10-балльная</SelectItem>
                                <SelectItem value="A_F">A-F (буквенная)</SelectItem>
                                <SelectItem value="PERCENTAGE">Проценты (0-100)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Округление</Label>
                        <Select value={draft.rounding} onValueChange={(v) => setDraft({ ...draft, rounding: v as "UP" | "DOWN" | "NEAREST" })}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UP">Вверх</SelectItem>
                                <SelectItem value="DOWN">Вниз</SelectItem>
                                <SelectItem value="NEAREST">К ближайшему</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Минимальный балл</Label>
                        <Input
                            type="number"
                            min="0"
                            value={draft.minPassScore}
                            onChange={(e) => setDraft({ ...draft, minPassScore: parseInt(e.target.value) || 0 })}
                            className="bg-background border-border"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Веса оценок (%)</Label>
                        <div className={`flex items-center gap-2 text-xs font-medium ${isValidWeights ? 'text-green-400' : 'text-red-400'}`}>
                            {!isValidWeights && <AlertCircle className="h-3 w-3" />}
                            Сумма: {weightsTotal}%
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Экзамены</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={draft.weights.exams}
                                onChange={(e) => setDraft({
                                    ...draft,
                                    weights: { ...draft.weights, exams: parseInt(e.target.value) || 0 }
                                })}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Контрольные</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={draft.weights.control}
                                onChange={(e) => setDraft({
                                    ...draft,
                                    weights: { ...draft.weights, control: parseInt(e.target.value) || 0 }
                                })}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Домашние</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={draft.weights.homework}
                                onChange={(e) => setDraft({
                                    ...draft,
                                    weights: { ...draft.weights, homework: parseInt(e.target.value) || 0 }
                                })}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Активность</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={draft.weights.participation}
                                onChange={(e) => setDraft({
                                    ...draft,
                                    weights: { ...draft.weights, participation: parseInt(e.target.value) || 0 }
                                })}
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    {!isValidWeights && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <p className="text-xs text-red-400">Сумма весов должна быть равна 100%</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
