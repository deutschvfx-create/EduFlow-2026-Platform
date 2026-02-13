"use client";

import { motion } from "framer-motion";
import { SchoolSearch } from "@/components/organizations/school-search";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play, BookOpen, Users, Star } from "lucide-react";
import Link from "next/link";
import { JoinOrgModal } from "@/components/organizations/join-org-modal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedJoinOrg, setSelectedJoinOrg] = useState<{ id: string, name: string } | null>(null);

  // Auto-open join modal after registration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('join') === 'true' && user) {
      const pending = localStorage.getItem('pending_join_org');
      if (pending) {
        try {
          setSelectedJoinOrg(JSON.parse(pending));
          localStorage.removeItem('pending_join_org');
        } catch (e) {
          console.error("Failed to parse pending join org:", e);
        }
      }
    }
  }, [user]);

  const handleJoinRequest = (org: { id: string, name: string }) => {
    setSelectedJoinOrg(org);
  };

  const scrollToSearch = () => {
    const element = document.getElementById('search-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center relative overflow-hidden">
      {/* Premium Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full max-w-7xl px-6 py-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#0F3D4C] rounded-xl flex items-center justify-center shadow-lg shadow-[#0F3D4C]/20">
            <Sparkles className="h-6 w-6 text-primary fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#0F3D4C] tracking-tighter leading-none">Uni Prime</span>
            <div className="flex gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-2 w-2 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-[#0F3D4C]/60 hover:text-[#0F3D4C] uppercase tracking-widest text-[10px]">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#0F3D4C] hover:bg-[#1A5D70] text-white rounded-xl px-6 font-bold shadow-xl shadow-[#0F3D4C]/10 h-10 uppercase tracking-widest text-[10px]">Регистрация</Button>
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-5xl px-6 pt-12 pb-24 z-10 flex flex-col items-center text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#DDE7EA] mb-6">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Будущее образования здесь
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-[#0F3D4C] tracking-tight leading-[0.9]">
            Ваша школа. <br />
            <span className="text-primary italic">Без границ.</span>
          </h1>
          <p className="text-[#0F3D4C]/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Uni Prime — это открытая платформа для обучения. Найдите лучшую школу или создайте свою за 5 минут.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          id="search-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl mb-24 scroll-mt-32"
        >
          <SchoolSearch onJoinRequest={handleJoinRequest} />
          <p className="mt-4 text-[10px] font-black text-[#0F3D4C]/30 uppercase tracking-[0.2em]">
            Поиск среди 1,240+ учебных центров
          </p>
        </motion.div>

        {/* Features / Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-[40px] border border-white/50 p-8 rounded-[40px] text-left hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-[#0F3D4C] mb-2 uppercase tracking-tight">Я Ученик</h3>
              <p className="text-[#0F3D4C]/50 text-sm font-medium mb-6">
                Найдите школу по душе, отправьте заявку и начните учиться прямо сейчас.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="link"
                  onClick={scrollToSearch}
                  className="p-0 text-primary font-black uppercase tracking-widest text-[10px] gap-2 w-fit"
                >
                  Найти школу <ArrowRight className="h-3 w-3" />
                </Button>
                <Link href="/register?role=student">
                  <Button variant="link" className="p-0 text-[#0F3D4C]/40 font-black uppercase tracking-widest text-[10px] gap-2 w-fit hover:text-primary">
                    Просто зарегистрироваться <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-[40px] border border-white/50 p-8 rounded-[40px] text-left hover:shadow-2xl hover:shadow-primary/10 transition-all group lg:scale-105 bg-gradient-to-br from-white/90 to-primary/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-14 w-14 bg-[#0F3D4C] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-[#0F3D4C]/20">
                <Play className="h-7 w-7 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold text-[#0F3D4C] mb-2 uppercase tracking-tight">Я Директор</h3>
              <p className="text-[#0F3D4C]/50 text-sm font-medium mb-6">
                Запустите полноценную школу: расписание, оплаты, студенты и преподаватели в одном месте.
              </p>
              <Link href="/register?role=owner">
                <Button variant="link" className="p-0 text-primary font-black uppercase tracking-widest text-[10px] gap-2 text-[#0F3D4C]">
                  Создать школу <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 backdrop-blur-[40px] border border-white/50 p-8 rounded-[40px] text-left hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-14 w-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-[#0F3D4C] mb-2 uppercase tracking-tight">Я Учитель</h3>
              <p className="text-[#0F3D4C]/50 text-sm font-medium mb-6">
                Присоединяйтесь к существующим организациям или ведите свои группы независимо.
              </p>
              <Link href="/register?role=teacher">
                <Button variant="link" className="p-0 text-primary font-black uppercase tracking-widest text-[10px] gap-2">
                  Начать преподавать <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <JoinOrgModal
        open={!!selectedJoinOrg}
        onOpenChange={(open) => !open && setSelectedJoinOrg(null)}
        organizationId={selectedJoinOrg?.id || ""}
        organizationName={selectedJoinOrg?.name || ""}
      />
    </div>
  );
}
