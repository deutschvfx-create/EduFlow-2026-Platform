"use client";

import { use } from "react";
import { useStudents } from "@/hooks/use-students";
import { useOrganization } from "@/hooks/use-organization";
import { StudentIDCard } from "@/components/students/student-id-card";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PrintIDCardPageProps {
    params: Promise<{ id: string }>;
}

export default function PrintIDCardPage({ params }: PrintIDCardPageProps) {
    const { id } = use(params);
    const { students, loading } = useStudents();
    const { currentOrganizationId } = useOrganization();
    const router = useRouter();

    const student = students.find(s => s.id === id);

    useEffect(() => {
        if (!loading && student && currentOrganizationId) {
            // Give it a tiny moment to render the QR code
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, student, currentOrganizationId]);

    if (loading) return <div className="p-8 font-black uppercase flex items-center gap-2 animate-pulse">Preparing document...</div>;
    if (!student || !currentOrganizationId) return <div className="p-8 text-red-500 font-bold">Student not found.</div>;

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-8 print:p-0 print:bg-white">
            {/* Screen-only Controls */}
            <div className="mb-8 flex gap-4 print:hidden">
                <Button
                    onClick={() => window.print()}
                    className="bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white font-black"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Again
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-[#DDE7EA] text-[#0F3D4C]/60 font-bold"
                >
                    <X className="h-4 w-4 mr-2" />
                    Close
                </Button>
            </div>

            {/* The CR80 Card */}
            <div className="bg-white shadow-2xl print:shadow-none">
                <StudentIDCard
                    student={student}
                />
            </div>

            {/* Print Instructions (Screen only) */}
            <div className="mt-8 text-center space-y-2 print:hidden">
                <p className="text-[#0F3D4C]/40 text-xs font-bold uppercase tracking-widest">Print Instructions</p>
                <p className="text-[#0F3D4C]/60 text-[10px] leading-relaxed max-w-xs mx-auto">
                    Ensure "Background Graphics" is <b>enabled</b> in your print settings for the best results.
                </p>
            </div>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: 85.6mm 53.98mm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    nav, sidebar, button, .print-hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
