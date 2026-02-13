'use client';

import { useState, useEffect, useRef } from "react";
import { Student } from "@/lib/types/student";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import {
    Users,
    Printer,
    Download,
    MoreVertical,
    Ban,
    Trash2,
    Timer,
    AlertCircle,
    CheckCircle2,
    Phone,
    MessageCircle,
    FileText,
    Image as ImageIcon,
    TrendingUp,
    CalendarCheck,
    ArrowDownCircle,
    ArrowUpCircle,
    Settings,
    Mail,
    Wallet,
    ExternalLink,
    FileDown,
    History
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StudentIDCardProps {
    student: Student | null;
    onAction?: (action: string, id: string) => void;
}

export function StudentIDCard({ student, onAction }: StudentIDCardProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number, secs: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const balance = 4500; // Mock balance data
    const isDebt = balance < 0;
    const previewRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!student?.paidUntil) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const target = new Date(student.paidUntil!).getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [student?.paidUntil]);

    if (!student) return (
        <div className="w-full bg-white/60 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 h-[160px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
                <Users className="h-7 w-7 opacity-30" />
                <p className="text-[13px] font-medium tracking-tight">Select a student to view identity profile</p>
            </div>
        </div>
    );

    const statusInfo = {
        ACTIVE: { label: "ACTIVE", color: "bg-[#22C55E]", text: "text-white" },
        PAUSED: { label: "PAUSED", color: "bg-[#F59E0B]", text: "text-white" },
        BLOCKED: { label: "BLOCKED", color: "bg-[#EF4444]", text: "text-white" },
        EXPIRED: { label: "EXPIRED", color: "bg-[#EF4444]", text: "text-white" },
    };

    const studentStatus = (student.status?.toUpperCase() as keyof typeof statusInfo) || 'ACTIVE';
    // const cardRef = useRef<HTMLDivElement>(null); // This was already declared above, moving the new code here.

    const handlePrint = () => {
        window.print();
    };

    const handleExportPng = async () => {
        if (!exportRef.current) return;

        try {
            const dataUrl = await toPng(exportRef.current, {
                quality: 1.0,
                pixelRatio: 3, // Ultra-HD Quality
                style: {
                    transform: 'none',
                    margin: '0',
                    padding: '0',
                }
            });

            const link = document.createElement('a');
            const birthYear = new Date(student.birthDate).getFullYear();
            const fileName = `${student.lastName.toUpperCase()}_${student.firstName.toUpperCase()}_${birthYear}.png`;

            link.download = fileName;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error exporting passport PNG:', err);
        }
    };

    // Extract card rendering to reusable function
    const renderCard = (isExportMode: boolean = false) => (
        <div className={cn(
            "relative w-[520px] h-[320px] rounded-[14px] bg-white overflow-hidden border border-slate-200 flex flex-col group transition-all duration-300",
            !isExportMode && "shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
        )}>

            {/* HEADER: School Name + Document Title */}
            <div className="h-[46px] bg-[#0F3D4C] shrink-0 flex flex-col items-center justify-center px-6">
                <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase leading-tight">UNI PRIME</span>
                <span className="text-[7px] font-bold text-white/80 tracking-[0.25em] uppercase mt-0.5">OFFICIAL STUDENT PASSPORT</span>
            </div>

            <div className="flex-1 px-6 pt-6 pb-8 flex gap-6">
                {/* LEFT ZONE: Photo Frame */}
                <div className="w-[165px] h-[230px] rounded-[7px] bg-slate-100 p-[1px] shrink-0 border border-slate-200 self-start mb-5 shadow-sm">
                    <div className="w-full h-full rounded-[6px] overflow-hidden bg-white flex items-center justify-center">
                        {student.passportPhotoUrl ? (
                            <img
                                src={student.passportPhotoUrl}
                                alt="Student Photo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-slate-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Photo Required</p>
                                <p className="text-[7px] text-slate-300 mt-1">Passport Style</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT ZONE: Information & QR */}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0 py-1">
                    {/* TOP: Name + Personal Data */}
                    <div className="flex flex-col gap-0.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ФАМИЛИЯ</span>
                            <span className="text-[17px] text-[#0F172A] font-bold font-inter leading-tight uppercase tracking-wide">
                                {student.lastName.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ИМЯ</span>
                            <span className="text-[17px] text-[#0F172A] font-bold font-inter leading-tight uppercase tracking-wide">
                                {student.firstName.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-start gap-8">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ДАТА РОЖДЕНИЯ</span>
                                <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                    {new Date(student.birthDate).toLocaleDateString('ru-RU')}
                                </span>
                            </div>

                            {/* Gender - Passport Style */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ПОЛ</span>
                                <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                    {student.gender === 'M' ? 'М' : student.gender === 'F' ? 'Ж' : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM: Level, Group, ID + QR */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                            {/* Level - Only visible in UI/Non-Export */}
                            {!isExportMode && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">УРОВЕНЬ</span>
                                    <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">{student.level || "B2.2"}</span>
                                </div>
                            )}

                            {/* Group - Only visible in UI/Non-Export */}
                            {!isExportMode && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ГРУППА</span>
                                    <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                        {student.groupIds && student.groupIds.length > 0 ? `Группа ${student.groupIds.length}` : "—"}
                                    </span>
                                </div>
                            )}

                            {/* Status Badge - State Indicator (Hidden in Export) */}
                            {!isExportMode && (
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md w-fit font-semibold text-[13px] tracking-wider uppercase shadow-sm animate-pulse",
                                    student.status === 'ACTIVE' && "bg-[#22C55E] text-white",
                                    student.status === 'PENDING' && "bg-[#F59E0B] text-white",
                                    student.status === 'SUSPENDED' && "bg-[#EF4444] text-white",
                                    student.status === 'ARCHIVED' && "bg-[#94A3B8] text-white"
                                )}>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        student.status === 'ACTIVE' && "bg-white",
                                        student.status === 'PENDING' && "bg-white",
                                        student.status === 'SUSPENDED' && "bg-white",
                                        student.status === 'ARCHIVED' && "bg-white"
                                    )} />
                                    {student.status === 'ACTIVE' ? 'АКТИВЕН' : student.status === 'PENDING' ? 'ОЖИДАНИЕ' : student.status === 'SUSPENDED' ? 'ПРИОСТАНОВЛЕН' : student.status === 'ARCHIVED' ? 'АРХИВ' : 'АКТИВЕН'}
                                </div>
                            )}

                            {/* Valid Until - Conditional Display */}
                            {student.validUntil && (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[11px] text-[#64748B] font-medium font-inter uppercase tracking-wider">Valid Until:</span>
                                    <span className="text-[13px] text-[#0F172A] font-semibold font-inter leading-none">
                                        {new Date(student.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: QR Zone - ID Verification Only */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0 -translate-y-[86px]">
                            {/* Label above QR */}
                            <span className="text-[10px] text-[#64748B] font-semibold tracking-[0.06em] uppercase text-center leading-[14px]">
                                СКАН ДЛЯ ПРОВЕРКИ<br />ВХОД / CHECK-IN
                            </span>
                            {/* QR Code - Security: Contains URL for public verification or ID for internal scan */}
                            <div className="p-2 bg-white border border-[rgba(15,23,42,0.08)] rounded-[10px]">
                                <QRCode
                                    value={
                                        typeof window !== 'undefined'
                                            ? `${window.location.origin}/verify/${student.id}`
                                            : `https://unipri.me/verify/${student.id}`
                                    }
                                    size={114}
                                    level="H"
                                    fgColor="#000000"
                                />
                            </div>
                            {/* Student ID below QR */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-[11px] text-[#64748B] font-medium font-inter uppercase tracking-wider">ID:</span>
                                <span className="text-[13px] text-[#0F172A] font-semibold font-mono leading-none tracking-tight">
                                    {student.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-white border-b border-slate-200">
            {/* PROFILE HEADER - Standard Layout */}
            <div className="max-w-[1280px] mx-auto px-6 py-2">
                <div className="flex items-start gap-6">

                    {/* LEFT: PASSPORT PREVIEW */}
                    <div className="shrink-0 w-[286px] h-[176px]">
                        {/* ID CARD - Preview Mode (55% scale) */}
                        <div
                            className="scale-[0.55] origin-top-left cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setIsModalOpen(true)}
                            title="Нажмите для просмотра в полном размере"
                        >
                            {renderCard()}
                        </div>

                        {/* Modal - Full View Mode (Minimalist Document Preview) */}
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogContent
                                className="max-w-fit p-0 bg-transparent border-none shadow-none outline-none focus:ring-0 focus:outline-hidden"
                                showCloseButton={false}
                            >
                                <div className="flex flex-col items-center gap-12 py-10">
                                    {/* The Document - 1:1 Scale with specialized shadow */}
                                    <div className="shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[14px] overflow-hidden bg-white">
                                        <div ref={previewRef}>
                                            {renderCard()}
                                        </div>
                                    </div>

                                    {/* Action Buttons - Secondary Visual Style, floating below */}
                                    <div className="flex gap-6 items-center">
                                        <Button
                                            onClick={handleExportPng}
                                            variant="ghost"
                                            className="h-10 px-6 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-medium tracking-wide"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Сохранить PNG</span>
                                        </Button>

                                        <div className="w-px h-4 bg-white/20" />

                                        <Button
                                            onClick={handlePrint}
                                            variant="ghost"
                                            className="h-10 px-6 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-medium tracking-wide"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Печать паспорта</span>
                                        </Button>

                                        <div className="w-px h-4 bg-white/20" />

                                        <Button
                                            onClick={() => setIsModalOpen(false)}
                                            variant="ghost"
                                            className="h-10 px-6 text-white/50 hover:text-white hover:bg-white/10 transition-all font-medium tracking-wide uppercase text-[11px]"
                                        >
                                            Закрыть
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* HIDDEN PRINT-READY CARD FOR PNG EXPORT */}
                        {/* This captures the "clean" document version (no status/level/group) */}
                        <div className="fixed -left-[9999px] top-0 pointer-events-none select-none opacity-0">
                            <div ref={exportRef}>
                                {renderCard(true)}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT side empty - Restored to normal order */}
                    <div className="flex-1" />
                </div>
            </div>
        </div>
    );
}
