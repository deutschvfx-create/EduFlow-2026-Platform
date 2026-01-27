"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()

    const skipAuth = (role: 'director' | 'student') => {
        // Создаем видимость залогиненного пользователя для системы
        localStorage.setItem('user', JSON.stringify({ 
            email: 'debug@owner.com', 
            role: role.toUpperCase() 
        }));
        
        // Просто уходим на нужную страницу
        router.push(`/${role}`);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 border-2 border-red-900">
                <CardHeader>
                    <CardTitle className="text-white text-center text-xl">
                        РЕЖИМ РАЗРАБОТКИ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-zinc-400 text-sm text-center">
                        Регистрация временно отключена. Используйте кнопки ниже для быстрого входа.
                    </p>
                    
                    <Button 
                        onClick={() => skipAuth('director')} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
                    >
                        ВОЙТИ КАК ДИРЕКТОР
                    </Button>

                    <Button 
                        onClick={() => skipAuth('student')} 
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 py-6"
                    >
                        Войти как Студент
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}