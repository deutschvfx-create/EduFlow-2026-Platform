'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Save, Trash2, Edit2, BadgeInfo } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Comment {
    id: string;
    text: string;
    type: "GENERAL" | "EXAM" | "SUBSTITUTION" | "ONLINE";
    author: string;
    createdAt: string;
}

interface LessonCommentsProps {
    lessonId: string;
}

export function LessonComments({ lessonId }: LessonCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            text: newComment,
            type: "GENERAL",
            author: "Я",
            createdAt: new Date().toISOString()
        };

        setComments([comment, ...comments]);
        setNewComment("");
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[hsl(var(--foreground))]">Комментарии к уроку</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Заметки, видимые в отчётах и расписании</p>
                    </div>
                </div>
                {!isEditing && comments.length === 0 && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-primary hover:bg-primary/90 text-foreground rounded-xl h-10 px-4 font-bold text-xs gap-2"
                    >
                        Добавить
                    </Button>
                )}
            </div>

            {isEditing || comments.length > 0 ? (
                <div className="space-y-4">
                    {/* Input Area */}
                    {(isEditing || comments.length > 0) && (
                        <Card className="bg-white border-[hsl(var(--border))] shadow-sm overflow-hidden rounded-2xl">
                            <CardContent className="p-0">
                                <Textarea
                                    placeholder="Напишите комментарий (например: Контрольная работа, Замена преподавателя...)"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[120px] border-none focus-visible:ring-0 resize-none p-4 text-sm text-[hsl(var(--foreground))] placeholder:text-muted-foreground"
                                />
                                <div className="p-3 bg-[hsl(var(--secondary))] border-t border-[hsl(var(--border))] flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 rounded-lg bg-white border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--muted-foreground))] hover:bg-white/50 transition-colors uppercase tracking-wider">
                                            Контрольная
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-white border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--muted-foreground))] hover:bg-white/50 transition-colors uppercase tracking-wider">
                                            Замена
                                        </button>
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={!newComment.trim()}
                                        className="bg-primary hover:bg-primary/90 text-foreground rounded-lg h-9 px-4 font-bold text-xs gap-2 shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        Сохранить
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-4 rounded-2xl bg-white border border-[hsl(var(--border))] group hover:border-cyan-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-cyan-50 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {comment.author[0]}
                                        </div>
                                        <span className="text-xs font-bold text-[hsl(var(--foreground))]">{comment.author}</span>
                                        <span className="text-[10px] text-muted-foreground">•</span>
                                        <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                                            {format(new Date(comment.createdAt), "HH:mm", { locale: ru })}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-primary hover:bg-cyan-50">
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setComments(comments.filter(c => c.id !== comment.id))}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-12 border-2 border-dashed border-[hsl(var(--border))] rounded-3xl flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))] flex items-center justify-center mb-4">
                        <BadgeInfo className="h-8 w-8 text-cyan-200" />
                    </div>
                    <h4 className="text-[hsl(var(--foreground))] font-bold mb-1">Нет комментариев</h4>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-[200px]">Добавьте примечание к этому уроку, оно будет видно в отчётах</p>
                </div>
            )}
        </div>
    );
}
