'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import { useOrganization } from "@/hooks/use-organization";
import { generateId } from "@/lib/utils";

interface CreateAnnouncementModalProps {
    onSuccess: () => void;
}

export function CreateAnnouncementModal({ onSuccess }: CreateAnnouncementModalProps) {
    const { currentOrganizationId } = useOrganization();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    const handleSubmit = async () => {
        if (!title || !currentOrganizationId) return;

        try {
            const { announcementsRepo } = await import("@/lib/data/announcements.repo");
            await announcementsRepo.add(currentOrganizationId, {
                id: generateId(),
                organizationId: currentOrganizationId,
                title,
                content: (document.getElementById('content') as HTMLTextAreaElement)?.value || '',
                status: 'PUBLISHED',
                authorId: 'director-id', // Still mock but at least repo call will work
                authorName: 'Admin',
                authorRole: 'DIRECTOR',
                targetType: 'ALL',
                createdAt: new Date().toISOString()
            });
            setOpen(false);
            setTitle('');
            onSuccess();
        } catch (error) {
            console.error("Failed to create announcement:", error);
            alert("Ошибка при создании объявления");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-zinc-500 transition-colors">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 uppercase tracking-tighter">Пост</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Новое объявление</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Заголовок *</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Текст</Label>
                        <Textarea id="content" placeholder="Важное сообщение..." className="bg-zinc-950 border-zinc-800" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!title} className="bg-amber-600 hover:bg-amber-700 text-white">Опубликовать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
