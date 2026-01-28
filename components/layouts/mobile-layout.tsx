"use client";

import { MobileHeader } from "@/components/navigation/mobile-header";
import { MobileNavBar } from "@/components/navigation/mobile-nav-bar";
import { SwipeableTabs } from "@/components/navigation/swipeable-tabs";

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
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col lg:hidden">
            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content with Swipe Support */}
            <main className="flex-1 overflow-hidden pb-20">
                <SwipeableTabs tabs={mainTabs}>
                    <div className="h-full overflow-y-auto">
                        <div className="px-4 py-6">
                            {children}
                        </div>
                    </div>
                </SwipeableTabs>
            </main>

            {/* Bottom Navigation */}
            <MobileNavBar />
        </div>
    );
}
