'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

interface CreateCourseModalProps {
    onSuccess: () => void;
}

export function CreateCourseModal({ onSuccess }: CreateCourseModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const { currentOrganizationId } = useOrganization();

    const handleSubmit = () => {
        if (!name || !currentOrganizationId) return;

        import("@/lib/data/courses.repo").then(({ coursesRepo }) => {
            coursesRepo.add(currentOrganizationId, {
                id: generateId(),
                organizationId: currentOrganizationId,
                name,
                code: 'NEW',
                facultyId: 'unknown',
                departmentId: 'unknown',
                status: 'ACTIVE',
                level: 'A1',
                teacherIds: [],
                groupIds: [],
                createdAt: new Date().toISOString()
            });
            setOpen(false);
            setName('');
            onSuccess();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center justify-center gap-2.5 w-[140px] h-[96px] rounded-[14px] bg-white border border-[#DDE7EA] hover:border-[#2EC4C6] hover:bg-[#2EC4C6]/8 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="h-9 w-9 rounded-xl bg-[#F2F7F6] flex items-center justify-center group-hover:bg-[#2EC4C6]/15 text-[#0F3D4C] transition-colors">
                        <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0F3D4C] transition-colors">Курс</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать предмет</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Название *</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-background border-border" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-border hover:bg-secondary hover:text-foreground">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!name} className="bg-primary hover:bg-primary/90 text-foreground">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
