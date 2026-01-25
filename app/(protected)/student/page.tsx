import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StudentDashboard() {
    return (
        <div className="p-6 md:p-8 space-y-6 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Hello, Alex!</h1>
                    <p className="text-zinc-400">Level 5 Scholar • 2,450 XP</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 p-4 flex flex-col items-center min-w-[120px]">
                        <span className="text-2xl font-bold text-amber-400">12 🔥</span>
                        <span className="text-xs text-zinc-500">Day Streak</span>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader>
                            <CardTitle className="text-zinc-200">Current Course: Advanced English</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                </div>
                                <p className="text-xs text-zinc-500 pt-2">Next Lesson: "Phrasal Verbs" tomorrow at 10:00 AM</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <h3 className="font-semibold text-zinc-200">Homework</h3>
                                <Badge variant="secondary">2 Pending</Badge>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                    <span className="text-2xl">🧠</span>
                                </div>
                                <h3 className="font-semibold text-zinc-200">Flashcards</h3>
                                <Badge variant="secondary">Start Review</Badge>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase text-zinc-500 tracking-wider">Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[{ n: "You", x: 2450, r: 1 }, { n: "Maria", x: 2300, r: 2 }, { n: "John", x: 2100, r: 3 }].map((u, i) => (
                                    <div key={i} className={`flex items-center justify-between ${i === 0 ? 'bg-zinc-800 p-2 rounded -mx-2' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold ${i === 0 ? 'text-amber-400' : 'text-zinc-500'}`}>#{u.r}</span>
                                            <span className="text-sm font-medium">{u.n}</span>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-400">{u.x} XP</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
