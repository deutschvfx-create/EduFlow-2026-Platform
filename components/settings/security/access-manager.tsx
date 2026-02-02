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
    LogOut,
    PauseCircle,
    PlayCircle,
    Loader2,
    ZoomIn,
    AlertCircle,
    Maximize2
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Session {
    id: string;
    device: string;
    ip?: string;
    location?: string;
    lastActive: any; // Firestore Timestamp
    isCurrent: boolean;
    type: 'desktop' | 'mobile' | 'support';
    status: 'active' | 'blocked';
    expiresAt?: number;
}

export function AccessManager() {
    const { user } = useAuth();

    // Support Link State
    const [generatingLink, setGeneratingLink] = useState(false);
    const [supportLink, setSupportLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [duration, setDuration] = useState("1h");

    // Magic Login State
    const [magicToken, setMagicToken] = useState<string | null>(null);
    const [loadingMagic, setLoadingMagic] = useState(false);
    const [magicError, setMagicError] = useState<string | null>(null);

    // QR Zoom State
    const [zoomedQr, setZoomedQr] = useState<string | null>(null);

    // App Link State
    const [appUrl, setAppUrl] = useState("https://eduflow.app");

    // Real Sessions
    const [sessions, setSessions] = useState<Session[]>([]);
    const [guestTimers, setGuestTimers] = useState<Record<string, number>>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            setAppUrl(window.location.origin);
        }
    }, []);

    // 🕒 Owner-side countdown for guest sessions
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newTimers: Record<string, number> = {};

            sessions.forEach(s => {
                if (s.type === 'support' && s.expiresAt) {
                    const left = s.expiresAt - now;
                    newTimers[s.id] = left > 0 ? left : 0;
                }
            });

            setGuestTimers(newTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [sessions]);

    const formatCountdown = (ms: number) => {
        if (ms <= 0) return "00:00";
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 1. Fetch Real Sessions
    useEffect(() => {
        if (!user || !db) return;

        const q = query(
            collection(db, "users", user.uid, "sessions"),
            orderBy("lastActive", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("📱 Sessions Snapshot received. Count:", snapshot.size);
            const sessionsData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Check if this is the current device by comparing with localStorage
                const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('eduflow_device_id') : null;

                return {
                    id: doc.id,
                    ...data,
                    isCurrent: doc.id === currentDeviceId
                } as Session;
            });
            setSessions(sessionsData);
        }, (error) => {
            console.error("Error fetching sessions:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Generate Magic Token (On Mount or Refresh)
    const generateMagicToken = async () => {
        if (!user) return;
        setLoadingMagic(true);
        setMagicError(null);
        try {
            const idToken = await user.getIdToken();
            // FIXED PATH: /api/... instead of /app/api/...
            const res = await fetch('/api/auth/generate-magic-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to generate token");
            }

            const data = await res.json();
            if (data.url) {
                setMagicToken(data.url);
            }
        } catch (e: any) {
            console.error("Failed to generate magic token", e);
            setMagicError(e.message || "Ошибка сервера");
        } finally {
            setLoadingMagic(false);
        }
    };

    // Auto-generate on mount
    useEffect(() => {
        generateMagicToken();
        // Refresh token every 55 mins? Or simply when user clicks refresh.
    }, [user]);


    // Helper Actions
    const generateSupportLink = async () => {
        if (!user) return;
        setGeneratingLink(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/generate-support-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ duration })
            });

            if (!response.ok) throw new Error('Failed to generate support link');

            const data = await response.json();
            setSupportLink(data.url);
        } catch (error) {
            console.error("Support Link gen error:", error);
            // We could add a local error state for support link if needed
        } finally {
            setGeneratingLink(false);
        }
    };

    const copyToClipboard = () => {
        if (supportLink) {
            navigator.clipboard.writeText(supportLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const toggleSessionStatus = async (id: string, currentStatus: string) => {
        if (!user || !db) return;
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        await updateDoc(doc(db, "users", user.uid, "sessions", id), {
            status: newStatus
        });
    };

    const removeSession = async (id: string) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, "users", user.uid, "sessions", id));
    };

    // Format Date Helper
    const formatLastActive = (timestamp: any) => {
        if (!timestamp) return "Unknown";
        // If Firestore Timestamp
        if (timestamp.toDate) {
            const date = timestamp.toDate();
            // Simple relative time
            const diff = (new Date().getTime() - date.getTime()) / 1000;
            if (diff < 60) return "Just now";
            if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            return date.toLocaleDateString();
        }
        return "Recently";
    };

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* LEFT COLUMN: My Devices (QR + List) */}
                    <div className="space-y-4">

                        {/* 1. Connect New Device (QR) */}
                        <div className="p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
                            <div className="mb-4">
                                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto">
                                    <Smartphone className="h-5 w-5 text-indigo-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Подключить устройство</h3>
                            <p className="text-zinc-400 text-sm mb-6 max-w-[200px]">
                                Отсканируйте, чтобы войти с телефона автоматически
                            </p>

                            <div className="bg-white p-3 rounded-xl shadow-lg relative cursor-pointer group" onClick={() => magicToken && setZoomedQr(magicToken)}>
                                {loadingMagic ? (
                                    <div className="h-32 w-32 flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
                                    </div>
                                ) : magicError ? (
                                    <div className="h-32 w-32 flex flex-col items-center justify-center text-red-500 text-center p-2">
                                        <AlertCircle className="h-8 w-8 mb-2 flex-shrink-0" />
                                        <span className="text-[10px] font-medium leading-tight max-w-full break-words">{magicError}</span>
                                        <button onClick={(e) => { e.stopPropagation(); generateMagicToken(); }} className="mt-2 text-[10px] underline text-neutral-500 hover:text-neutral-900">Повторить</button>
                                    </div>
                                ) : magicToken ? (
                                    <>
                                        <QRCode
                                            value={magicToken}
                                            size={128}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                            <ZoomIn className="h-8 w-8 text-black drop-shadow-md" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-32 w-32 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-xs text-center p-2">
                                        Нет связи
                                    </div>
                                )}
                            </div>
                            <Button variant="link" className="text-[9px] h-auto p-0 text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pt-1" onClick={generateMagicToken}>
                                Обновить QR
                            </Button>
                        </div>

                        {/* 2. Active Sessions List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Monitor className="h-3.5 w-3.5" />
                                    Ваши устройства
                                </h3>
                                <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-zinc-800 text-zinc-400">
                                    {sessions.filter(s => s.type !== 'support').length}
                                </Badge>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                <AnimatePresence initial={false}>
                                    {sessions.filter(s => s.type !== 'support').length === 0 && (
                                        <p className="text-center text-xs text-zinc-600 py-4">Нет активных сессий</p>
                                    )}
                                    {sessions.filter(s => s.type !== 'support').map((session) => (
                                        <motion.div
                                            key={session.id}
                                            layout
                                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                                            exit={{ opacity: 0, height: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className={cn(
                                                "group flex flex-col gap-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl transition-all hover:border-zinc-700/50 hover:bg-zinc-900/50",
                                                session.status === 'blocked' && "opacity-60 grayscale-[0.5] border-red-500/20 bg-red-500/5"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={cn(
                                                        "relative h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center transition-colors",
                                                        session.status === 'blocked' ? "bg-red-500/10 text-red-500" :
                                                            session.isCurrent ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                                    )}>
                                                        {session.status === 'blocked' ? (
                                                            <PauseCircle className="h-4 w-4" />
                                                        ) : session.type === 'support' ? (
                                                            <Shield className="h-4 w-4" />
                                                        ) : session.type === 'mobile' ? (
                                                            <Smartphone className="h-4 w-4" />
                                                        ) : (
                                                            <Laptop className="h-4 w-4" />
                                                        )}

                                                        {session.status !== 'blocked' && session.isCurrent && (
                                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-zinc-200 truncate">{session.device.substring(0, 25)}</span>
                                                            {session.status === 'blocked' && <Badge variant="destructive" className="text-[9px] h-4 px-1">Приостановлен</Badge>}
                                                            {session.type === 'support' && <Badge variant="outline" className="text-[9px] h-4 px-1 border-indigo-500/30 text-indigo-400 bg-indigo-500/5">Гость</Badge>}
                                                            {session.isCurrent && <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">Вы</Badge>}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                                                            {/* Location optional if not provided */}
                                                            {session.location && (
                                                                <>
                                                                    <span>{session.location}</span>
                                                                    <span className="text-zinc-700 mx-0.5">•</span>
                                                                </>
                                                            )}
                                                            <span>{formatLastActive(session.lastActive)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {!session.isCurrent && (
                                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/30">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-7 text-[10px] flex-1",
                                                            session.status === 'blocked' ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" : "text-amber-500 hover:text-amber-400 hover:bg-amber-400/10"
                                                        )}
                                                        onClick={() => toggleSessionStatus(session.id, session.status)}
                                                    >
                                                        {session.status === 'blocked' ? (
                                                            <>
                                                                <PlayCircle className="h-3 w-3 mr-1.5" />
                                                                Возобновить
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PauseCircle className="h-3 w-3 mr-1.5" />
                                                                Отключить временно
                                                            </>
                                                        )}
                                                    </Button>
                                                    <div className="w-[1px] h-4 bg-zinc-800" />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-[10px] flex-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                        onClick={() => removeSession(session.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1.5" />
                                                        Удалить
                                                    </Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Guest/Support Access (Kept mostly same, but cleaned up) */}
                    <div className="h-full">
                        <div className="h-full p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Shield className="h-64 w-64 text-indigo-500" />
                            </div>

                            <div className="space-y-6 relative z-10 flex flex-col h-full">
                                <div className="space-y-2">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-100">
                                        Гостевой доступ
                                    </h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                                        Создайте безопасную временную ссылку для техподдержки или администратора.
                                        Доступ автоматически закроется по истечении таймера.
                                    </p>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    {!supportLink ? (
                                        <div className="space-y-5 bg-zinc-900/40 p-5 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 pl-1">Выберите срок действия</label>
                                                <div className="relative group">
                                                    <select
                                                        value={duration}
                                                        onChange={(e) => setDuration(e.target.value)}
                                                        className="w-full h-11 bg-black/40 border border-zinc-800 rounded-lg px-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
                                                    >
                                                        <option value="5m">⚡ 5 минут (Быстрый осмотр)</option>
                                                        <option value="30m">⏱ 30 минут</option>
                                                        <option value="1h">⏳ 1 час (Стандарт)</option>
                                                        <option value="24h">📅 24 часа</option>
                                                        <option value="48h">📆 48 часов</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none group-hover:text-zinc-400" />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={generateSupportLink}
                                                disabled={generatingLink}
                                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xl shadow-indigo-500/20 text-xs tracking-wide uppercase"
                                            >
                                                {generatingLink ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" />
                                                        Генерация ключа...
                                                    </span>
                                                ) : "Создать ссылку доступа"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-5"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-medium px-1">
                                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                        </span>
                                                        Активная ссылка
                                                    </span>
                                                    <span className="text-zinc-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {duration}
                                                    </span>
                                                </div>

                                                <div className="bg-black/40 p-1 pr-1.5 rounded-lg border border-indigo-500/20 flex items-center gap-2">
                                                    <div className="h-9 flex-1 flex items-center px-3 font-mono text-xs text-indigo-300 truncate select-all">
                                                        {supportLink}
                                                    </div>
                                                    <Button size="icon" className="h-8 w-8 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white" onClick={copyToClipboard}>
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div
                                                className="bg-white p-4 rounded-xl shadow-2xl flex items-center gap-5 cursor-pointer hover:bg-zinc-50 transition-colors group/qr"
                                                onClick={() => setZoomedQr(supportLink)}
                                            >
                                                <div className="h-20 w-20 flex-shrink-0 bg-zinc-50 rounded border flex items-center justify-center relative">
                                                    <QRCode
                                                        value={supportLink}
                                                        size={72}
                                                        style={{ height: "100%", width: "100%" }}
                                                        viewBox={`0 0 256 256`}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded backdrop-blur-[1px]">
                                                        <ZoomIn className="h-6 w-6 text-black" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-zinc-900 uppercase tracking-wide">QR для входа</p>
                                                    <p className="text-[11px] text-zinc-500 leading-snug">
                                                        Нажмите, чтобы увеличить <br /> и сканировать удобнее.
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="destructive"
                                                className="w-full h-9 text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-none"
                                                onClick={() => setSupportLink(null)}
                                            >
                                                Аннулировать доступ
                                            </Button>

                                            {/* 🛡️ GUEST SESSION DISPLAY (MOVED HERE) */}
                                            {sessions.filter(s => s.type === 'support').length > 0 && (
                                                <div className="pt-4 border-t border-indigo-500/10 mt-4 space-y-3">
                                                    <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest pl-1">Подключенные гости</h4>
                                                    {sessions.filter(s => s.type === 'support').map((session) => (
                                                        <motion.div
                                                            key={session.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={cn(
                                                                "p-3 rounded-xl border transition-all flex flex-col gap-2",
                                                                session.status === 'blocked'
                                                                    ? "bg-red-500/5 border-red-500/20 opacity-70"
                                                                    : "bg-black/40 border-indigo-500/20"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className={cn(
                                                                        "h-7 w-7 rounded-full flex items-center justify-center",
                                                                        session.status === 'blocked' ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-400"
                                                                    )}>
                                                                        <Shield className="h-3.5 w-3.5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11px] font-bold text-zinc-200 truncate">{session.device}</p>
                                                                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                                                                            <span>{formatLastActive(session.lastActive)}</span>
                                                                            {session.expiresAt && (
                                                                                <>
                                                                                    <span className="text-zinc-700 mx-0.5">•</span>
                                                                                    <span className={cn(
                                                                                        "font-mono font-bold flex items-center gap-1",
                                                                                        guestTimers[session.id] && guestTimers[session.id] < 60000 ? "text-amber-500" : "text-indigo-400"
                                                                                    )}>
                                                                                        <Clock className="h-2.5 w-2.5" />
                                                                                        {formatCountdown(guestTimers[session.id] || 0)}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-zinc-500 hover:text-red-400"
                                                                        onClick={() => removeSession(session.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className={cn(
                                                                        "h-7 text-[9px] px-2 flex-1",
                                                                        session.status === 'blocked' ? "text-emerald-400 hover:bg-emerald-400/10" : "text-amber-500 hover:bg-amber-400/10"
                                                                    )}
                                                                    onClick={() => toggleSessionStatus(session.id, session.status)}
                                                                >
                                                                    {session.status === 'blocked' ? "Возобновить" : "Пауза"}
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Zoom Modal */}
            <Dialog open={!!zoomedQr} onOpenChange={() => setZoomedQr(null)}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-sm flex flex-col items-center justify-center p-10 gap-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">Сканируйте код</DialogTitle>
                    </DialogHeader>
                    <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.2)]">
                        {zoomedQr && (
                            <QRCode
                                value={zoomedQr}
                                size={240}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        )}
                    </div>
                    <p className="text-zinc-500 text-sm text-center">
                        Камера телефона авторизует вас автоматически
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}
