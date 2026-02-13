import { getAdminDb } from "@/lib/firebase-admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Users, GraduationCap, School } from "lucide-react";
import { notFound } from "next/navigation";
import { Student } from "@/lib/types/student";

// Force dynamic rendering as we fetch data based on ID
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
    const { id } = await params;

    const db = getAdminDb();
    if (!db) {
        console.error("Firebase Admin not initialized");
        return notFound();
    }

    let student: Student | null = null;

    try {
        const docRef = db.collection('users').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return notFound();
        }

        const data = docSnap.data();
        if (data?.role !== 'student') {
            return notFound();
        }

        student = { id: docSnap.id, ...data } as unknown as Student;
    } catch (error) {
        console.error("Error fetching student data:", error);
        return notFound();
    }

    if (!student) {
        return notFound();
    }

    // Default privacy settings if not set
    const settings = student.publicSettings || {
        showPhoto: true,
        showGender: true,
        showLevel: true,
        showGroup: true
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-sm bg-white rounded-[24px] shadow-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-[#0F3D4C] p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
                        <h1 className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-tight">
                            Official Student Passport
                        </h1>
                        <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">
                            EduFlow Language School
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center gap-6">

                    {/* Photo (Conditional) */}
                    {settings.showPhoto && (
                        <div className="w-32 h-32 rounded-full p-1 bg-white border-2 border-slate-100 shadow-lg -mt-16 relative z-20">
                            <Avatar className="w-full h-full rounded-full">
                                <AvatarImage src={student.passportPhotoUrl} className="object-cover" />
                                <AvatarFallback className="bg-slate-100 text-slate-400">
                                    <User className="w-12 h-12" />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    {/* Basic Info (ALWAYS VISIBLE) */}
                    <div className="text-center space-y-1">
                        <h2 className="text-[20px] font-black text-[#0F172A] uppercase tracking-tight leading-none">
                            {student.firstName} {student.lastName}
                        </h2>
                        <p className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
                            ID: {student.id.slice(0, 8)}...
                        </p>
                    </div>

                    {/* Status Badge (ALWAYS VISIBLE) */}
                    <Badge className={
                        student.status === 'ACTIVE'
                            ? "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 border-none px-4 py-1 text-[11px] font-black uppercase tracking-widest"
                            : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border-none px-4 py-1 text-[11px] font-black uppercase tracking-widest"
                    }>
                        {student.status === 'ACTIVE' ? 'Verified Student' : 'Archived Student'}
                    </Badge>

                    {/* Conditional Details Grid */}
                    <div className="w-full grid grid-cols-2 gap-3 mt-2">
                        <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Год рождения</span>
                            <span className="text-[14px] font-black text-[#0F172A]">
                                {new Date(student.birthDate).getFullYear()}
                            </span>
                        </div>

                        {settings.showGender && (
                            <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Пол</span>
                                <span className="text-[14px] font-black text-[#0F172A]">
                                    {student.gender === 'M' ? 'Мужской' : student.gender === 'F' ? 'Женский' : '—'}
                                </span>
                            </div>
                        )}

                        {settings.showLevel && (
                            <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Уровень</span>
                                <span className="text-[14px] font-black text-[#0F172A]">
                                    {student.level || "—"}
                                </span>
                            </div>
                        )}

                        {settings.showGroup && (
                            <div className="p-3 bg-slate-50 rounded-[16px] border border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Группы</span>
                                <span className="text-[14px] font-black text-[#0F172A]">
                                    {student.groupIds?.length || 0}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 w-full text-center">
                        <p className="text-[10px] text-[#94A3B8] max-w-[200px] mx-auto leading-relaxed">
                            This is an official digital identity of EduFlow Language School.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
