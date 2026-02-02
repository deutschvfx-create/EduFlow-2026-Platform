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
    QrCode as QrIcon,
    Copy,
    Check,
    Shield,
    X,
    ChevronDown
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import QRCode from "react-qr-code";

export function AccessManager() {
    const { user } = useAuth();
    const [generatingLink, setGeneratingLink] = useState(false);
    const [supportLink, setSupportLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // New Configuration State
    const [duration, setDuration] = useState("1h");
    const [showQr, setShowQr] = useState(false);

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
            // Append duration to the link query params
            setSupportLink(`https://eduflow.app/support-access?token=${token}&duration=${duration}`);
            setGeneratingLink(false);
            setShowQr(false); // Reset QR view
        }, 1000);
    };

    const copyToClipboard = () => {
        if (supportLink) {
            navigator.clipboard.writeText(supportLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getDurationLabel = (val: string) => {
        switch (val) {
            case '5m': return '5 мин';
            case '30m': return '30 мин';
            case '1h': return '1 час';
            case '24h': return '24 часа';
            case '48h': return '48 часов';
            default: return val;
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
                        {!supportLink ? (
                            <>
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    Настройте срок действия доступа и создайте временную ссылку для техподдержки.
                                </p>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-zinc-500">Срок действия</label>
                                    <div className="relative">
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full h-9 bg-zinc-900/50 border border-zinc-800 rounded px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                                        >
                                            <option value="5m">5 минут</option>
                                            <option value="30m">30 минут</option>
                                            <option value="1h">1 час</option>
                                            <option value="24h">24 часа (1 день)</option>
                                            <option value="48h">48 часов (2 дня)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>

                                <Button
                                    onClick={generateSupportLink}
                                    disabled={generatingLink}
                                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider"
                                >
                                    {generatingLink ? "Генерация..." : "Создать временную ссылку"}
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-indigo-500/30">
                                        <code className="text-[10px] text-indigo-300 truncate flex-1">{supportLink}</code>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400 hover:bg-indigo-500/20" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                        <span className="flex items-center gap-1 text-emerald-500/80">
                                            <Clock className="h-3 w-3" />
                                            Истекает через: <span className="font-bold text-emerald-500 ml-0.5">{getDurationLabel(duration)}</span>
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSupportLink(null);
                                                setShowQr(false);
                                            }}
                                            className="text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider"
                                        >
                                            Отменить
                                        </button>
                                    </div>
                                </div>

                                {showQr ? (
                                    <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4 relative animate-in fade-in zoom-in-95 duration-200">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 text-zinc-400 hover:text-zinc-600"
                                            onClick={() => setShowQr(false)}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                        <div className="p-2 border-2 border-dashed border-zinc-200 rounded-lg">
                                            <QRCode
                                                value={supportLink}
                                                size={150}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                viewBox={`0 0 256 256`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Отсканируйте для входа</p>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-indigo-500/10 flex items-center justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowQr(true)}
                                            className="h-9 border-dashed border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] w-full uppercase tracking-wider transition-all"
                                        >
                                            <QrIcon className="h-3.5 w-3.5 mr-2" />
                                            Показать QR-код
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
