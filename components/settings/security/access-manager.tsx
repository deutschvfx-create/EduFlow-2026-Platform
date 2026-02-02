"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Monitor,
    Smartphone,
    Clock,
    Trash2,
    QrCode as QrIcon,
    Copy,
    Check,
    Shield,
    X,
    ChevronDown,
    Laptop,
    LogOut
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

export function AccessManager() {
    const { user } = useAuth();

    // Support Link State
    const [generatingLink, setGeneratingLink] = useState(false);
    const [supportLink, setSupportLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [duration, setDuration] = useState("1h");

    // App Link State
    const [appUrl, setAppUrl] = useState("https://eduflow.app");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setAppUrl(window.location.origin);
        }
    }, []);

    // Mock sessions
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
        setTimeout(() => {
            const token = Math.random().toString(36).substring(7);
            setSupportLink(`${appUrl}/support-access?token=${token}&duration=${duration}`);
            setGeneratingLink(false);
        }, 800);
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
            {/* Active Sessions Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Активные сессии
                    </h3>
                    <Button variant="ghost" className="h-6 text-[10px] text-zinc-500 hover:text-red-400">
                        <LogOut className="h-3 w-3 mr-1" />
                        Выйти со всех устройств
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {sessions.map((session) => (
                        <div key={session.id} className="group flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`relative h-10 w-10 rounded-full flex items-center justify-center ${session.isCurrent ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"}`}>
                                    {session.type === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                                    {session.isCurrent && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-zinc-200">{session.device}</span>
                                        {session.isCurrent && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">Это устройство</Badge>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                        <span>{session.location}</span>
                                        <span className="text-zinc-700">•</span>
                                        <span>{session.lastActive}</span>
                                        <span className="text-zinc-700">•</span>
                                        <span className="font-mono text-zinc-600">{session.ip}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <Button request-confirmation variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Split Actions: Connect vs Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Connect New Device */}
                <div className="p-5 bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <QrIcon className="h-32 w-32" />
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-bold text-zinc-200 flex items-center justify-center gap-2">
                            <Smartphone className="h-4 w-4 text-indigo-400" />
                            Подключить устройство
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                            Отсканируйте код камерой телефона, <br /> чтобы открыть EduFlow на мобильном
                        </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-lg shadow-indigo-500/10 relative z-10 group cursor-pointer transition-transform hover:scale-105">
                        <QRCode
                            value={appUrl}
                            size={140}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                        <div className="absolute inset-x-0 bottom-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/70 text-white text-[9px] px-2 py-1 rounded-full backdrop-blur-md">Открыть</span>
                        </div>
                    </div>
                </div>

                {/* 2. Guest/Support Access */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Shield className="h-32 w-32 text-indigo-500" />
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-400" />
                            Гостевой доступ
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                            Временная ссылка для техподдержки
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        {!supportLink ? (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Срок действия</label>
                                    <div className="relative">
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 appearance-none cursor-pointer transition-colors hover:border-zinc-700"
                                        >
                                            <option value="5m">5 минут</option>
                                            <option value="30m">30 минут</option>
                                            <option value="1h">1 час</option>
                                            <option value="24h">24 часа</option>
                                            <option value="48h">48 часов</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                                <Button
                                    onClick={generateSupportLink}
                                    disabled={generatingLink}
                                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
                                >
                                    {generatingLink ? "Генерация ключа..." : "Создать ссылку"}
                                </Button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="p-3 bg-zinc-900/50 border border-emerald-500/20 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Активная ссылка
                                        </span>
                                        <span>Истекает: {duration}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-black/40 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-emerald-400 font-mono truncate">
                                            {supportLink}
                                        </code>
                                        <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white/90 p-3 rounded-lg flex items-center gap-4">
                                    <div className="h-16 w-16 bg-white p-1 rounded border border-zinc-200 flex-shrink-0">
                                        <QRCode
                                            value={supportLink}
                                            size={64}
                                            style={{ height: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-800 uppercase">QR для входа</p>
                                        <p className="text-[10px] text-zinc-500 leading-tight">
                                            Покажите этот код службе поддержки
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-8 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    onClick={() => setSupportLink(null)}
                                >
                                    Аннулировать ссылку
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
