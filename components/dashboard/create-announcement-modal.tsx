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
                <div className="group flex flex-col items-center justify-center gap-2.5 w-[140px] h-[96px] rounded-[14px] bg-white border border-[#DDE7EA] hover:border-[#2EC4C6] hover:bg-[#2EC4C6]/8 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="h-9 w-9 rounded-xl bg-[#F2F7F6] flex items-center justify-center group-hover:bg-[#2EC4C6]/15 text-[#0F3D4C] transition-colors">
                        <Megaphone className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0F3D4C] transition-colors">Пост</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Новое объявление</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Заголовок *</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Текст</Label>
                        <Textarea id="content" placeholder="Важное сообщение..." className="bg-background border-border" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-border hover:bg-secondary hover:text-foreground">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!title} className="bg-amber-600 hover:bg-amber-700 text-foreground">Опубликовать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
