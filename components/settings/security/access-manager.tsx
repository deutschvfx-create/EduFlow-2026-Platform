"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Monitor,
    Smartphone,
    Globe,
    Clock,
    Trash2,
    Plus,
    QrCode,
    Copy,
    Check,
    Shield
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function AccessManager() {
    const { user } = useAuth();
    const [generatingLink, setGeneratingLink] = useState(false);
    const [supportLink, setSupportLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Mock sessions for now (Real implementation would require Firestore 'sessions' collection)
    const sessions = [
        {
            id: "1",
            device: "Windows PC (Chrome)",
            ip: "192.168.1.105",
            location: "Dushanbe, Tajikistan",
            lastActive: "Сейчас",
            isCurrent: true,
            type: "desktop"
        },
        {
            id: "2",
            device: "iPhone 13 Pro",
            ip: "10.0.0.1",
            location: "Dushanbe, Tajikistan",
            lastActive: "2 мин назад",
            isCurrent: false,
            type: "mobile"
        }
    ];

    const generateSupportLink = () => {
        setGeneratingLink(true);
        // Simulate API call
        setTimeout(() => {
            const token = Math.random().toString(36).substring(7);
            setSupportLink(`https://eduflow.app/support-access?token=${token}`);
            setGeneratingLink(false);
        }, 1000);
    };

    const copyToClipboard = () => {
        if (supportLink) {
            navigator.clipboard.writeText(supportLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Sessions */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Активные сессии
                    </h3>
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${session.isCurrent ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"}`}>
                                        {session.type === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-zinc-200">{session.device}</span>
                                            {session.isCurrent && <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-500/30 text-emerald-500">Это устройство</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                            <span>{session.location}</span>
                                            <span>•</span>
                                            <span>{session.lastActive}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-400">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Access */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Гостевой доступ (Поддержка)
                    </h3>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg space-y-4">
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Создайте временную ссылку для техподдержки или администратора.
                            Доступ автоматически отключится через 1 час.
                        </p>

                        {!supportLink ? (
                            <Button
                                onClick={generateSupportLink}
                                disabled={generatingLink}
                                className="w-full h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider"
                            >
                                {generatingLink ? "Генерация..." : "Создать временную ссылку"}
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-indigo-500/30">
                                    <code className="text-[10px] text-indigo-300 truncate flex-1">{supportLink}</code>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400" onClick={copyToClipboard}>
                                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Истекает через 59:59</span>
                                    <button onClick={() => setSupportLink(null)} className="text-red-400 hover:underline">Отменить</button>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-indigo-500/10 flex items-center justify-center">
                            <Button variant="outline" className="h-8 border-dashed border-zinc-700 text-zinc-400 hover:text-white text-[10px] w-full">
                                <QrCode className="h-3.5 w-3.5 mr-2" />
                                Показать QR-код для входа
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
