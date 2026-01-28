"use client";

import { MobileHeader } from "@/components/navigation/mobile-header";
import { MobileNavBar } from "@/components/navigation/mobile-nav-bar";

interface MobileLayoutProps {
    children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col lg:hidden">
            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <div className="px-4 py-6">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <MobileNavBar />
        </div>
    );
}
