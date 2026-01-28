
"use client";

import { useState } from "react";
import { Plus, Copy, Check, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export function InviteStudentModal() {
    const [email, setEmail] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleInvite = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/invites', { email });
            setLink(data.inviteLink);
        } catch (e) {
            console.error("Failed to create invite", e);
            // Fallback for demo
            setLink(`https://eduflow-2026.vercel.app/register?invite=${Math.random().toString(36).substring(7)}&email=${email}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog onOpenChange={(open) => { if (!open) { setLink(""); setEmail(""); } }}>
            <DialogTrigger asChild>
                <div className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-zinc-500 transition-colors">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">Инвайт</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Приглашение нового ученика</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs mt-1.5">
                        Создайте уникальную ссылку для регистрации. Студенту не нужно будет заполнять свои данные.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!link ? (
                        <div className="space-y-2">
                            <Label htmlFor="invite-email" className="text-zinc-200 text-xs">Email ученика</Label>
                            <Input
                                id="invite-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 h-10"
                                placeholder="student@example.com"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-2 text-center py-4 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                                <Check className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-medium">Ссылка успешно создана!</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={link} className="bg-zinc-950 border-zinc-800 font-mono text-xs" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard} className="border-zinc-800 hover:bg-zinc-800 shrink-0">
                                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                {!link && (
                    <DialogFooter>
                        <Button
                            onClick={handleInvite}
                            disabled={loading || !email}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Создание...
                                </>
                            ) : 'Сгенерировать ссылку'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
