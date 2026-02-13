"use client";

import QRCode from "react-qr-code";
import { Student } from "@/lib/types/student";

interface StudentCardHorizontalProps {
    student: Student;
    organizationId: string;
}

export function StudentCardHorizontal({ student, organizationId }: StudentCardHorizontalProps) {
    const secureToken = btoa(`${student.id}-${organizationId}`);

    return (
        <div className="bg-white border-b border-[#DDE7EA] p-5 relative overflow-hidden flex justify-end pr-8 bg-neutral-50/30">
            {/* The ID Card Container - Strict CR80 Proportion (85.6 x 53.98 mm) */}
            <div
                id="student-id-card-printable"
                className="relative bg-white border border-[#DDE7EA] shadow-lg rounded-[4mm] overflow-hidden"
                style={{
                    width: "85.6mm",
                    height: "53.98mm",
                    minWidth: "85.6mm",
                    minHeight: "53.98mm"
                }}
            >
                {/* Security Background / Watermark (Subtle) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center rotate-[-25deg] select-none">
                    <span className="text-[120px] font-black text-[#0F3D4C]">UNI PRIME</span>
                </div>

                {/* Top Badge - Passport Style */}
                <div className="absolute top-0 left-0 right-0 h-[8mm] bg-[#FFC533] flex items-center justify-center shadow-sm z-10">
                    <span className="text-white text-[9px] font-black uppercase tracking-[0.3em]">
                        Student Identification Card
                    </span>
                </div>

                {/* Main Content Area */}
                <div className="absolute inset-0 pt-[10mm] px-[4mm] pb-[3mm] flex gap-[4mm]">

                    {/* Left: Photo & Short ID */}
                    <div className="flex flex-col items-center gap-[1.5mm] w-[24mm]">
                        <div className="w-full aspect-[3/4] bg-[#FAFAF2] border border-[#DDE7EA] rounded-sm overflow-hidden shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`}
                                alt="Student"
                                className="w-full h-full object-cover grayscale-[0.1]"
                            />
                        </div>
                        <div className="text-center">
                            <span className="text-[6px] text-[#0F3D4C]/40 font-black uppercase block mb-[-2px]">ID Number</span>
                            <span className="text-[10px] text-[#0F3D4C] font-black tracking-tight">
                                {student.id.slice(-8).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Center: Essential Data */}
                    <div className="flex-1 flex flex-col justify-center py-[1mm]">
                        <div className="mb-[3mm]">
                            <span className="text-[6px] text-[#0F3D4C]/30 font-black uppercase tracking-widest block mb-0.5">Full Name</span>
                            <h2 className="text-[14px] font-black text-[#0F3D4C] uppercase leading-none break-words">
                                {student.firstName}<br />{student.lastName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-[2mm]">
                            <div>
                                <span className="text-[6px] text-[#0F3D4C]/30 font-black uppercase tracking-widest block mb-0.5">Group</span>
                                <span className="text-[9px] font-bold text-[#0F3D4C]/70 uppercase">
                                    {student.groupIds[0] || "None"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[6px] text-[#0F3D4C]/30 font-black uppercase tracking-widest block mb-0.5">Status</span>
                                <div className="flex items-center gap-1">
                                    <div className="h-1 w-1 rounded-full bg-[#2EC4C6]" />
                                    <span className="text-[9px] font-bold text-[#0F3D4C]/70 uppercase">
                                        {student.status.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-[2mm] border-t border-[#DDE7EA]/50">
                            <span className="text-[6px] text-[#0F3D4C]/30 font-black uppercase tracking-widest block">Educational Institution</span>
                            <span className="text-[8px] font-bold text-[#2EC4C6] uppercase">UNI PRIME</span>
                        </div>
                    </div>

                    {/* Right: Large QR Code */}
                    <div className="w-[20mm] flex flex-col items-center justify-center gap-[1.5mm]">
                        <div className="w-full aspect-square p-[1.5mm] border border-[#DDE7EA] bg-white rounded-md shadow-sm">
                            <QRCode
                                value={JSON.stringify({
                                    sid: student.id,
                                    oid: organizationId,
                                    type: "STUDENT_ID",
                                    ts: Date.now()
                                })}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                fgColor="#0F3D4C"
                                level="M"
                            />
                        </div>
                        <span className="text-[6px] text-[#0F3D4C]/40 font-black uppercase text-center leading-tight">
                            SCAN FOR<br />ATTENDANCE
                        </span>
                    </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[1.5mm] bg-[#2EC4C6]/20"></div>
            </div>
        </div>
    );
}
