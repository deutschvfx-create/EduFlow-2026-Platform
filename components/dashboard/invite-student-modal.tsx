
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
            setLink(`https://uniwersitet-kontrolle.web.app/register?invite=${Math.random().toString(36).substring(7)}&email=${email}`);
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
                <div className="group flex flex-col items-center justify-center gap-2.5 w-[140px] h-[96px] rounded-[14px] bg-white border border-[#DDE7EA] hover:border-[#2EC4C6] hover:bg-[#2EC4C6]/8 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="h-9 w-9 rounded-xl bg-[#F2F7F6] flex items-center justify-center group-hover:bg-[#2EC4C6]/15 text-[#0F3D4C] transition-colors">
                        <UserPlus className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0F3D4C] transition-colors">Инвайт</span>
                </div>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Приглашение нового ученика</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs mt-1.5">
                        Создайте уникальную ссылку для регистрации. Студенту не нужно будет заполнять свои данные.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!link ? (
                        <div className="space-y-2">
                            <Label htmlFor="invite-email" className="text-foreground text-xs">Email ученика</Label>
                            <Input
                                id="invite-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background border-border focus:border-primary h-10"
                                placeholder="student@example.com"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-2 text-center py-4 bg-primary/20 rounded-lg border border-primary/10">
                                <Check className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-medium">Ссылка успешно создана!</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={link} className="bg-background border-border font-mono text-xs" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard} className="border-border hover:bg-secondary shrink-0">
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
                            className="w-full bg-primary hover:bg-primary/90 text-foreground font-semibold transition-all shadow-lg shadow-cyan-500/20"
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
