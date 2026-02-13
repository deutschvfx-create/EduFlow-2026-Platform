'use client';

import { useState, useRef } from "react";
import { Student } from "@/lib/types/student";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import {
    Printer,
    Download,
    Image as ImageIcon
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StudentPassportCardProps {
    student: Student;
    isExportMode?: boolean;
}

export function StudentPassportCard({ student, isExportMode = false }: StudentPassportCardProps) {
    return (
        <div className={cn(
            "relative w-[520px] h-[320px] rounded-[14px] bg-white overflow-hidden border border-slate-200 flex flex-col group transition-all duration-300",
            !isExportMode && "shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
        )}>
            {/* HEADER: School Name + Document Title */}
            <div className="h-[46px] bg-[#0F3D4C] shrink-0 flex flex-col items-center justify-center px-6">
                <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase leading-tight">EDUFLOW LANGUAGE SCHOOL</span>
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

                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ПОЛ</span>
                                <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                    {student.gender === 'M' ? 'М' : student.gender === 'F' ? 'Ж' : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                            {!isExportMode && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">УРОВЕНЬ</span>
                                    <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                        {student.level || "B2.2"}
                                    </span>
                                </div>
                            )}

                            {!isExportMode && (
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md w-fit font-semibold text-[13px] tracking-wider uppercase shadow-sm animate-pulse",
                                    student.status === 'ACTIVE' && "bg-[#22C55E] text-white",
                                    student.status === 'PENDING' && "bg-[#F59E0B] text-white",
                                    student.status === 'SUSPENDED' && "bg-[#EF4444] text-white"
                                )}>
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                    {student.status === 'ACTIVE' ? 'АКТИВЕН' : student.status === 'PENDING' ? 'ОЖИДАНИЕ' : 'БЛОКИРОВАН'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-1.5 shrink-0 -translate-y-[86px]">
                            <span className="text-[10px] text-[#64748B] font-semibold tracking-[0.06em] uppercase text-center leading-[14px]">
                                СКАН ДЛЯ ПРОВЕРКИ<br />ВХОД / CHECK-IN
                            </span>

                            <div className="p-2 bg-white border border-[rgba(15,23,42,0.08)] rounded-[10px]">
                                <QRCode
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/student/${student.id}`}
                                    size={114}
                                    level="H"
                                    fgColor="#000000"
                                />
                            </div>
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
}

interface StudentPassportModalProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentPassportModal({ student, open, onOpenChange }: StudentPassportModalProps) {
    const exportRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPng = async () => {
        if (!exportRef.current || !student) return;

        try {
            const dataUrl = await toPng(exportRef.current, {
                quality: 1.0,
                pixelRatio: 3,
                style: {
                    transform: 'none',
                    margin: '0',
                    padding: '0',
                }
            });

            const link = document.createElement('a');
            const fileName = `STUDENT_${student.lastName.toUpperCase()}_${student.firstName.toUpperCase()}.png`;
            link.download = fileName;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error exporting passport PNG:', err);
        }
    };

    if (!student) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-w-fit p-0 bg-transparent border-none shadow-none outline-none focus:ring-0 focus:outline-hidden"
                    showCloseButton={false}
                >
                    <div className="flex flex-col items-center gap-12 py-10">
                        <div className="shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[14px] overflow-hidden bg-white">
                            <StudentPassportCard student={student} />
                        </div>

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
                                onClick={() => onOpenChange(false)}
                                variant="ghost"
                                className="h-10 px-6 text-white/50 hover:text-white hover:bg-white/10 transition-all font-medium tracking-wide uppercase text-[11px]"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="fixed -left-[9999px] top-0 pointer-events-none select-none opacity-0">
                <div ref={exportRef}>
                    <StudentPassportCard student={student} isExportMode={true} />
                </div>
            </div>
        </>
    );
}
