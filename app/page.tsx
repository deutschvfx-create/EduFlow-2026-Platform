
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleSelection = (role: 'student' | 'director') => {
    router.push(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            EduFlow
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
            Платформа нового поколения для управления образованием.
            Кто вы?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Student Card */}
          <Card
            className="group relative overflow-hidden bg-zinc-900 border-zinc-800 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20"
            onClick={() => handleSelection('student')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-10 flex flex-col items-center gap-6 relative z-10 h-full justify-center">
              <div className="p-6 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <GraduationCap className="h-12 w-12" />
              </div>
              <div className="space-y-3 text-center">
                <h2 className="text-2xl font-bold text-white">Я Ученик / Родитель</h2>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  Доступ к материалам, домашним заданиям и личному прогрессу.
                </p>
              </div>
              <div className="mt-4 flex items-center text-indigo-400 font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Войти в кабинет <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Director Card */}
          <Card
            className="group relative overflow-hidden bg-zinc-900 border-zinc-800 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
            onClick={() => handleSelection('director')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-10 flex flex-col items-center gap-6 relative z-10">
              <div className="p-6 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <Briefcase className="h-12 w-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Я Директор / Бизнес</h2>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  Управление школой, сотрудниками, финансами и аналитикой.
                </p>
              </div>
              <div className="mt-4 flex items-center text-purple-400 font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Войти в систему <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-zinc-500 text-sm">
          Уже есть аккаунт? <a href="/login" className="text-zinc-300 hover:text-white underline underline-offset-4 decoration-zinc-700">Войти</a>
        </div>
      </div>
    </div>
  );
}
