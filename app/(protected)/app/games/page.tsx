"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { Loader2 } from "lucide-react";

export default function GamesRedirect() {
    const { isTeacher, isStudent, loading } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isTeacher) {
                router.replace("/teacher");
            } else if (isStudent) {
                router.replace("/student/games");
            } else {
                router.replace("/app/dashboard");
            }
        }
    }, [isTeacher, isStudent, loading, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return null;
}
