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

interface CreateAnnouncementModalProps {
    onSuccess: () => void;
}

export function CreateAnnouncementModal({ onSuccess }: CreateAnnouncementModalProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    const handleSubmit = () => {
        if (!title) return;

        import("@/lib/data/announcements.repo").then(({ announcementsRepo }) => {
            announcementsRepo.add({
                id: crypto.randomUUID(),
                title,
                content: (document.getElementById('content') as HTMLTextAreaElement)?.value || '',
                status: 'PUBLISHED',
                authorId: 'director-id', // Mock
                authorName: 'Admin', // Mock
                authorRole: 'DIRECTOR',
                targetType: 'ALL',
                createdAt: new Date().toISOString()
            });
            setOpen(false);
            setTitle('');
            onSuccess();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 group">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-xs">Объявление</span>
                </Button>
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
