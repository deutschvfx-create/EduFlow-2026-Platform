"use client";

import { useState } from "react";
import { MobileHeader } from "@/components/navigation/mobile-header";
import { MobileNavBar } from "@/components/navigation/mobile-nav-bar";
import { SwipeableTabs } from "@/components/navigation/swipeable-tabs";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";

interface MobileLayoutProps {
    children: React.ReactNode;
}

const mainTabs = [
    { path: "/app/dashboard", component: null },
    { path: "/app/students", component: null },
    { path: "/app/schedule", component: null },
    { path: "/app/chat", component: null },
    { path: "/app/settings", component: null },
];

export function MobileLayout({ children }: MobileLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col laptop:hidden overflow-hidden selection:bg-indigo-500/30">
            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content with Swipe Support */}
            <main className="flex-1 relative overflow-hidden">
                <SwipeableTabs tabs={mainTabs}>
                    <div className="absolute inset-0 overflow-y-auto scroll-smooth overscroll-contain pb-24">
                        <div className="px-4 py-6 min-h-full">
                            {children}
                        </div>
                    </div>
                </SwipeableTabs>
            </main>

            {/* Bottom Navigation */}
            <MobileNavBar onOpenMenu={() => setIsDrawerOpen(true)} />

            {/* Global Drawer (Rendered at top level to avoid clipping) */}
            <MobileDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    );
}
