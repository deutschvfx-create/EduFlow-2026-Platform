'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/register');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100">
      <p className="text-zinc-500 animate-pulse">Redirecting...</p>
    </div>
  );
}
