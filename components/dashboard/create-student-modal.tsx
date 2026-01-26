'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface CreateStudentModalProps {
    onSuccess: () => void;
}

export function CreateStudentModal({ onSuccess }: CreateStudentModalProps) {
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = () => {
        if (!firstName || !lastName) return;

        import("@/lib/data/students.repo").then(({ studentsRepo }) => {
            studentsRepo.add({
                id: crypto.randomUUID(),
                firstName,
                lastName,
                birthDate: '2000-01-01',
                createdAt: new Date().toISOString(),
                status: 'ACTIVE',
                groups: []
            });
            setOpen(false);
            setFirstName('');
            setLastName('');
            onSuccess();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 group">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-xs">Добавить студента</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Добавить студента</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Введите данные студента для регистрации.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fname">Имя *</Label>
                            <Input id="fname" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lname">Фамилия *</Label>
                            <Input id="lname" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-zinc-950 border-zinc-800" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dob">Дата рождения</Label>
                        <Input id="dob" type="date" className="bg-zinc-950 border-zinc-800 w-full block" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Отмена</Button>
                    <Button onClick={handleSubmit} disabled={!firstName || !lastName} className="bg-emerald-600 hover:bg-emerald-700 text-white">Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
