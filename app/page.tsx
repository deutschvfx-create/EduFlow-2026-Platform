'use client';

import { OnboardingFlow } from "@/components/auth/onboarding-flow";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-indigo-500/30">
      <OnboardingFlow />
    </div>
  );
}
